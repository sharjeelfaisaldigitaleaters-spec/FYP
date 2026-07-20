import { useState, useEffect, useRef, useCallback } from "react";
import {
  PhoneOff, AlertCircle, MessageCircle, Loader2,
  Send, ChevronDown, User, Phone, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Persona {
  id: string;
  name: string;
  relation: string;
  voice_id?: string | null;
}

interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
  audioState?: "idle" | "loading" | "playing";
}

type ConvMode = "chat" | "call";
type CallStatus = "idle" | "connecting" | "listening" | "processing" | "speaking";

// ─── AudioQueue for sequential playback ──────────────────────────────────────

class AudioQueue {
  private queue: string[] = [];
  private playing = false;
  public onPlayStart?: () => void;
  public onPlayEnd?: () => void;

  async enqueue(base64: string) {
    this.queue.push(base64);
    if (!this.playing) this.processNext();
  }

  private async processNext() {
    if (!this.queue.length) {
      this.playing = false;
      this.onPlayEnd?.();
      return;
    }
    this.playing = true;
    this.onPlayStart?.();
    const b64 = this.queue.shift()!;
    try {
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await new Promise<void>((res) => {
        audio.onended = () => { URL.revokeObjectURL(url); res(); };
        audio.onerror = () => res();
        audio.play().catch(() => res());
      });
    } catch { /* ignore */ }
    this.processNext();
  }

  clear() { this.queue = []; this.playing = false; }
  get isPlaying() { return this.playing; }
}

// ─── SSE stream reader ────────────────────────────────────────────────────────
// Buffers partial lines across `read()` calls — a chunk boundary can land
// mid-line, and splitting naively on "\n" per-chunk silently drops or
// corrupts data whenever that happens.
async function readSSEStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onEvent: (parsed: any) => void
) {
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? ""; // last element may be an incomplete line — keep it for next read
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith("data: ")) continue;
      const data = line.slice(6).trim();
      if (!data || data === "[DONE]") continue;
      try {
        onEvent(JSON.parse(data));
      } catch {
        // Malformed/partial JSON — should not happen now that lines are buffered, but ignore defensively.
      }
    }
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Conversation() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const userId = user?.id ?? "user-1";

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [mode, setMode] = useState<ConvMode>("chat");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [callSeconds, setCallSeconds] = useState(0);

  // VAD state
  const [userBars, setUserBars] = useState<number[]>(Array(40).fill(3));
  const [aiBars, setAiBars] = useState<number[]>(Array(40).fill(3));

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const audioQueueRef = useRef(new AudioQueue());
  const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const vadAnalyserRef = useRef<AnalyserNode | null>(null);
  const vadAnimRef = useRef<number>(0);
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRecordingRef = useRef(false);
  const isAISpeakingRef = useRef(false);
  const isCallActiveRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const aiAnimRef = useRef<number>(0);

  // startVADRecording is only re-memoized when isCallActive flips, so its
  // long-lived listening loop can otherwise end up calling a stopVADAndSend
  // closure frozen from an earlier render (e.g. before personas/session even
  // loaded). Refs sidestep that: whichever stale closure runs, it always
  // reads the current values here instead of a captured-at-creation snapshot.
  const selectedPersonaRef = useRef<Persona | null>(null);
  const sessionIdRef = useRef<string | null>(null);
  useEffect(() => { selectedPersonaRef.current = selectedPersona; }, [selectedPersona]);
  useEffect(() => { sessionIdRef.current = sessionId; }, [sessionId]);

  const loadPersonaSession = useCallback(async (persona: Persona) => {
    setSelectedPersona(persona);
    setMessages([]);
    try {
      // Resume the most recent session for this persona so past history isn't lost.
      const sessions = await fetchApi(`/conversation/sessions?persona_id=${persona.id}`);
      if (sessions?.length > 0) {
        const latest = sessions[0];
        setSessionId(latest.id);
        try {
          const history = await fetchApi(`/conversation/messages/${latest.id}`);
          if (history?.length > 0) {
            setMessages(history.map((m: any) => ({
              id: m.id,
              type: m.type,
              content: m.content,
              timestamp: new Date(m.created_at),
            })));
          }
        } catch (err) {
          console.error("Failed to load message history:", err);
        }
        return;
      }

      const session = await fetchApi("/conversation/sessions", {
        method: "POST",
        body: JSON.stringify({ persona_id: persona.id })
      });
      setSessionId(session.session_id || session.id);
    } catch {
      setSessionId("local-" + Math.random().toString(36).slice(2));
    }
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const data = await fetchApi("/conversation/personas");
        if (data?.length > 0) {
          const formatted: Persona[] = data.map((p: any) => ({
            id: p.id, name: p.name || "AI Replica", relation: p.relation || "Loved One", voice_id: p.voice_id || null,
          }));
          setPersonas(formatted);
          const requestedId = searchParams.get("persona");
          const requested = requestedId ? formatted.find(p => p.id === requestedId) : null;
          await loadPersonaSession(requested || formatted[0]);
        }
      } catch (err) {
        console.error("Failed to load personas:", err);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadPersonaSession]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Chat Send ────────────────────────────────────────────────────────────────

  const sendMessage = useCallback(async (textOverride?: string) => {
    const text = textOverride ?? input.trim();
    if (!text || !selectedPersona || !sessionId) return;
    setInput("");

    const userMsg: ChatMessage = {
      id: Math.random().toString(36).slice(2),
      type: "user", content: text, timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    const aiId = Math.random().toString(36).slice(2);
    const aiMsg: ChatMessage = { id: aiId, type: "ai", content: "", timestamp: new Date() };
    setMessages(prev => [...prev, aiMsg]);

    try {
      const formData = new FormData();
      formData.append("persona_id", selectedPersona.id);
      formData.append("session_id", sessionId);
      formData.append("text_query", text);

      const token = localStorage.getItem("mk_access_token");
      const res = await fetch(`${API_BASE_URL}/conversation/chat`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) throw new Error(`Chat request failed (${res.status})`);

      const reader = res.body!.getReader();
      let fullText = "";
      let serviceErrored = false;

      await readSSEStream(reader, (parsed) => {
        if (parsed.type === "text" && parsed.delta) {
          fullText += parsed.delta;
          setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m));
        }
        if (parsed.type === "audio" && parsed.chunk && mode === "call") {
          audioQueueRef.current.enqueue(parsed.chunk);
        }
        if (parsed.type === "service_error") {
          serviceErrored = true;
          const msg = parsed.message || "AI service error.";
          fullText = msg;
          setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: msg } : m));
          toast.error(msg);
        }
      });

      // In call mode — speak the response if no audio was streamed
      if (!serviceErrored && mode === "call" && !audioQueueRef.current.isPlaying && selectedPersona.voice_id) {
        speakText(fullText, aiId);
      }

    } catch (err: any) {
      console.error("Chat send failed:", err);
      setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `Error: ${err?.message || "Something went wrong."}` } : m));
    } finally {
      setIsTyping(false);
    }
  }, [input, selectedPersona, sessionId, mode]);

  // ── TTS speak ────────────────────────────────────────────────────────────────

  const speakText = useCallback(async (text: string, msgId?: string) => {
    // Reads from the ref rather than `selectedPersona` directly — this can be invoked
    // from the call-mode listening loop, whose closures may be stale (see the refs
    // declared above for why), so the ref keeps it correct regardless.
    const currentPersona = selectedPersonaRef.current;
    if (!currentPersona?.voice_id) return;
    if (msgId) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, audioState: "loading" } : m));
    try {
      const formData = new FormData();
      formData.append("persona_id", currentPersona.id);
      formData.append("text", text);
      const token = localStorage.getItem("mk_access_token");
      const res = await fetch(`${API_BASE_URL}/conversation/speak`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.audio) {
        if (msgId) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, audioState: "playing" } : m));
        audioQueueRef.current.enqueue(data.audio);
        setTimeout(() => {
          if (msgId) setMessages(prev => prev.map(m => m.id === msgId ? { ...m, audioState: "idle" } : m));
        }, 3000);
      }
    } catch { /* ignore */ }
  }, [selectedPersona]);

  // ── Call Mode ────────────────────────────────────────────────────────────────

  const sendGreeting = useCallback(async () => {
    if (!selectedPersona || !sessionId) return;
    const greeting = `Salam! Main ${selectedPersona.name} hoon. Kya haal hai?`;
    const aiId = Math.random().toString(36).slice(2);
    setMessages(prev => [...prev, { id: aiId, type: "ai", content: "", timestamp: new Date() }]);

    // Stream greeting through TTS directly
    try {
      const formData = new FormData();
      formData.append("persona_id", selectedPersona.id);
      formData.append("text", greeting);
      const token = localStorage.getItem("mk_access_token");
      const res = await fetch(`${API_BASE_URL}/conversation/speak`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data.audio) audioQueueRef.current.enqueue(data.audio);
      }
    } catch { /* ignore */ }

    setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: greeting } : m));
  }, [selectedPersona, sessionId]);

  const animateAIBars = useCallback(() => {
    const draw = () => {
      setAiBars(Array(40).fill(0).map(() => Math.max(4, Math.random() * 85 + 10)));
      aiAnimRef.current = requestAnimationFrame(draw);
    };
    draw();
  }, []);

  const startVADRecording = useCallback(async () => {
    if (isRecordingRef.current || !isCallActiveRef.current) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      vadAnalyserRef.current = analyser;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
      mr.start(200);
      isRecordingRef.current = true;

      const timeData = new Uint8Array(analyser.fftSize);
      const freqData = new Uint8Array(analyser.frequencyBinCount);

      // Calibrate to the room's ambient noise floor for the first ~400ms so
      // background hiss doesn't get mistaken for continuous speech.
      let calibrated = false;
      let calibrationSamples: number[] = [];
      let noiseFloor = 0.01;
      let hasSpoken = false;
      const recordingStartedAt = Date.now();
      const MAX_TURN_MS = 20000; // safety net: never listen forever on one turn

      const getRms = () => {
        analyser.getByteTimeDomainData(timeData);
        let sumSquares = 0;
        for (let i = 0; i < timeData.length; i++) {
          const normalized = (timeData[i] - 128) / 128;
          sumSquares += normalized * normalized;
        }
        return Math.sqrt(sumSquares / timeData.length);
      };

      // VAD loop
      const vadLoop = () => {
        if (!vadAnalyserRef.current || !isRecordingRef.current) return;

        const rms = getRms();
        analyser.getByteFrequencyData(freqData);
        const bars = Array.from(freqData.slice(0, 40)).map(v => Math.max(3, (v / 255) * 90));
        setUserBars(bars);

        if (!calibrated) {
          calibrationSamples.push(rms);
          if (calibrationSamples.length >= 20) {
            const avgNoise = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length;
            noiseFloor = Math.max(avgNoise, 0.004);
            calibrated = true;
          }
        }

        const speakThreshold = noiseFloor + 0.018;
        const silenceThreshold = noiseFloor + 0.01;
        const isSpeaking = calibrated && rms > speakThreshold;

        // If AI is speaking and user is loud → interrupt
        if (isAISpeakingRef.current && isSpeaking) {
          audioQueueRef.current.clear();
          isAISpeakingRef.current = false;
          cancelAnimationFrame(aiAnimRef.current);
          setAiBars(Array(40).fill(3));
          setCallStatus("listening");
        }

        if (isSpeaking) {
          hasSpoken = true;
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
            silenceTimerRef.current = null;
          }
        } else if (calibrated && rms < silenceThreshold) {
          // Only count silence toward a stop once the user has actually spoken
          if (hasSpoken && !silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (!isAISpeakingRef.current) {
                stopVADAndSend(stream, audioCtx);
              }
              silenceTimerRef.current = null;
            }, 1200);
          }
        }

        // Safety net — force a stop if a turn runs unexpectedly long
        if (hasSpoken && !isAISpeakingRef.current && Date.now() - recordingStartedAt > MAX_TURN_MS) {
          if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
          stopVADAndSend(stream, audioCtx);
          return;
        }

        vadAnimRef.current = requestAnimationFrame(vadLoop);
      };
      vadAnimRef.current = requestAnimationFrame(vadLoop);

    } catch {
      toast.error("Microphone access needed for call mode.");
      endCall();
    }
  }, [isCallActive]);

  const stopVADAndSend = useCallback((stream: MediaStream, audioCtx: AudioContext) => {
    if (!isRecordingRef.current) return;
    isRecordingRef.current = false;
    cancelAnimationFrame(vadAnimRef.current);
    setUserBars(Array(40).fill(3));

    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;

    setCallStatus("processing");

    mr.onstop = async () => {
      stream.getTracks().forEach(t => t.stop());
      audioCtx.close();

      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      if (blob.size < 1000) {
        // Too small — ignore, resume listening
        setCallStatus("listening");
        startVADRecording();
        return;
      }

      // Send to backend
      const userMsgId = Math.random().toString(36).slice(2);
      const aiId = Math.random().toString(36).slice(2);
      setMessages(prev => [
        ...prev,
        { id: userMsgId, type: "user", content: "🎤 ...", timestamp: new Date() },
        { id: aiId, type: "ai", content: "", timestamp: new Date() }
      ]);

      try {
        const currentPersona = selectedPersonaRef.current;
        const currentSessionId = sessionIdRef.current;
        if (!currentPersona || !currentSessionId) {
          throw new Error("No active personality/session — try restarting the call.");
        }

        const formData = new FormData();
        formData.append("persona_id", currentPersona.id);
        formData.append("session_id", currentSessionId);
        formData.append("audio_file", blob, "recording.webm");

        const token = localStorage.getItem("mk_access_token");
        const res = await fetch(`${API_BASE_URL}/conversation/chat`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });

        if (!res.ok) throw new Error(`Chat request failed (${res.status})`);

        const reader = res.body!.getReader();
        let fullText = "";
        let serviceErrored = false;

        await readSSEStream(reader, (parsed) => {
          if (parsed.type === "input" && parsed.text) {
            setMessages(prev => prev.map(m => m.id === userMsgId ? { ...m, content: parsed.text } : m));
          }
          if (parsed.type === "text" && parsed.delta) {
            fullText += parsed.delta;
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: fullText } : m));
          }
          if (parsed.type === "audio" && parsed.chunk) {
            audioQueueRef.current.enqueue(parsed.chunk);
          }
          if (parsed.type === "service_error") {
            serviceErrored = true;
            const msg = parsed.message || "AI service error.";
            setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: msg } : m));
            toast.error(msg);
          }
        });

        if (serviceErrored) {
          // No audio was (or will be) queued for an error turn — resume listening directly
          // instead of waiting on an onPlayEnd that will never fire.
          setCallStatus("listening");
          startVADRecording();
          return;
        }

        // Speak if no audio was streamed
        if (!audioQueueRef.current.isPlaying && fullText && currentPersona.voice_id) {
          speakText(fullText, aiId);
        }

      } catch (err: any) {
        console.error("Call mode chat failed:", err);
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, content: `Error: ${err?.message || "Something went wrong."}` } : m));
        setCallStatus("listening");
        startVADRecording();
      }
    };

    mr.stop();
  }, [selectedPersona, sessionId, speakText, startVADRecording]);

  const startCall = useCallback(async () => {
    if (!selectedPersona) { toast.error("Select a personality first."); return; }
    if (!selectedPersona.voice_id) { toast.error("No voice clone set up. Set up voice in Create Personality."); return; }

    setIsCallActive(true);
    isCallActiveRef.current = true;
    setCallStatus("connecting");
    setCallSeconds(0);
    audioQueueRef.current.clear();

    // Setup audio queue callbacks
    audioQueueRef.current.onPlayStart = () => {
      isAISpeakingRef.current = true;
      setCallStatus("speaking");
      animateAIBars();
    };
    audioQueueRef.current.onPlayEnd = () => {
      isAISpeakingRef.current = false;
      cancelAnimationFrame(aiAnimRef.current);
      setAiBars(Array(40).fill(3));
      if (isCallActiveRef.current) {
        setCallStatus("listening");
        startVADRecording();
      }
    };

    // Call timer
    callTimerRef.current = setInterval(() => setCallSeconds(s => s + 1), 1000);

    // AI greeting
    try {
      setCallStatus("processing");
      await sendGreeting();
      // Wait to see if greeting audio starts playing. If not, transition to listening mode.
      setTimeout(() => {
        if (!audioQueueRef.current.isPlaying && isCallActiveRef.current) {
          setCallStatus("listening");
          startVADRecording();
        }
      }, 1500);
    } catch {
      setCallStatus("listening");
      startVADRecording();
    }
  }, [selectedPersona, sendGreeting, startVADRecording, animateAIBars]);

  const endCall = useCallback(() => {
    setIsCallActive(false);
    isCallActiveRef.current = false;
    setCallStatus("idle");
    isRecordingRef.current = false;
    isAISpeakingRef.current = false;

    cancelAnimationFrame(vadAnimRef.current);
    cancelAnimationFrame(aiAnimRef.current);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (callTimerRef.current) clearInterval(callTimerRef.current);

    mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioQueueRef.current.clear();

    setUserBars(Array(40).fill(3));
    setAiBars(Array(40).fill(3));
  }, []);

  const formatCallTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-80px)]">

      {/* ── CALL MODE ─────────────────────────────────────────────────────────── */}
      {mode === "call" && isCallActive && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-between pb-16 pt-12 px-6"
          style={{
            background: "radial-gradient(ellipse at top, #1a0533 0%, #0d0018 40%, #020008 100%)",
          }}
        >
          {/* Timer */}
          <div className="text-sm font-mono text-purple-300/70 tracking-widest">
            {formatCallTime(callSeconds)}
          </div>

          {/* Center: Avatar + visualizer */}
          <div className="flex flex-col items-center gap-8 flex-1 justify-center">
            {/* Avatar orb */}
            <div className="relative">
              {/* Outer pulse rings */}
              {callStatus === "listening" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping scale-150" />
                  <span className="absolute inset-0 rounded-full bg-emerald-500/5 animate-ping scale-[2] animation-delay-300" />
                </>
              )}
              {callStatus === "speaking" && (
                <>
                  <span className="absolute inset-0 rounded-full bg-violet-500/15 animate-ping scale-150" />
                  <span className="absolute inset-0 rounded-full bg-violet-500/8 animate-ping scale-[2] animation-delay-300" />
                </>
              )}
              {/* Orb */}
              <div
                className={cn(
                  "relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500",
                  callStatus === "listening" && "shadow-[0_0_60px_rgba(52,211,153,0.3)]",
                  callStatus === "speaking" && "shadow-[0_0_80px_rgba(167,139,250,0.5)]",
                  callStatus === "processing" && "shadow-[0_0_40px_rgba(251,191,36,0.3)]",
                  "bg-gradient-to-br from-violet-900/80 to-purple-950/80 border border-violet-500/20"
                )}
              >
                <span className="text-5xl font-black text-white/90 select-none">
                  {selectedPersona?.name?.[0]?.toUpperCase() ?? "?"}
                </span>
              </div>
            </div>

            {/* Persona name */}
            <div className="text-center">
              <p className="text-white text-xl font-bold">{selectedPersona?.name}</p>
              <p className="text-purple-300/60 text-sm mt-0.5">{selectedPersona?.relation}</p>
            </div>

            {/* Status label */}
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                callStatus === "listening" && "bg-emerald-400 animate-pulse",
                callStatus === "speaking" && "bg-violet-400 animate-pulse",
                callStatus === "processing" && "bg-amber-400 animate-pulse",
                callStatus === "connecting" && "bg-blue-400 animate-pulse",
              )} />
              <span className="text-sm text-white/60 capitalize">
                {callStatus === "listening" ? "Listening..." : callStatus === "speaking" ? "Speaking..." : callStatus === "processing" ? "Thinking..." : "Connecting..."}
              </span>
            </div>

            {/* Frequency Visualizers */}
            <div className="w-full max-w-sm space-y-4">
              {/* User mic bars */}
              <div className="space-y-1">
                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">You</p>
                <div className="flex items-end justify-center gap-0.5 h-10">
                  {userBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 max-w-[5px] rounded-full transition-all duration-75"
                      style={{
                        height: `${h}%`,
                        background: `hsl(${142 + i * 2}, 70%, ${40 + h * 0.2}%)`,
                        opacity: callStatus === "listening" ? 1 : 0.25,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* AI voice bars */}
              <div className="space-y-1">
                <p className="text-[10px] text-white/30 text-center uppercase tracking-widest">{selectedPersona?.name}</p>
                <div className="flex items-end justify-center gap-0.5 h-10">
                  {aiBars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 max-w-[5px] rounded-full transition-all duration-75"
                      style={{
                        height: `${h}%`,
                        background: `hsl(${262 + i * 2}, 80%, ${45 + h * 0.2}%)`,
                        opacity: callStatus === "speaking" ? 1 : 0.2,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* End Call Button */}
          <button
            onClick={endCall}
            className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.4)]"
          >
            <PhoneOff className="w-7 h-7 text-white" />
          </button>
        </div>
      )}

      {/* ── CHAT + CONTROLS ────────────────────────────────────────────────────── */}
      <div className="flex flex-col h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-background/80 backdrop-blur-sm flex-shrink-0">
          {/* Persona selector */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaMenu(v => !v)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-muted transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                {selectedPersona?.name?.[0] ?? "?"}
              </div>
              <span className="text-sm font-semibold text-foreground">{selectedPersona?.name ?? "Select Persona"}</span>
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            {showPersonaMenu && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border/50 rounded-xl shadow-xl z-20 min-w-[180px] overflow-hidden">
                {personas.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { loadPersonaSession(p); setShowPersonaMenu(false); }}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">
                      {p.name?.[0] ?? "A"}
                    </div>
                    <span className="text-foreground">{p.name || "AI Replica"}</span>
                  </button>
                ))}
                <button
                  onClick={() => { navigate("/dashboard/create-personality"); setShowPersonaMenu(false); }}
                  className="w-full text-left px-4 py-2.5 text-xs text-primary hover:bg-muted transition-colors border-t border-border/30"
                >
                  + Create New Personality
                </button>
              </div>
            )}
          </div>

          {/* Mode toggle + Call button */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-muted rounded-xl p-1">
              {(["chat", "call"] as ConvMode[]).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    "px-3 py-1 rounded-lg text-xs font-semibold transition-all capitalize flex items-center gap-1.5",
                    mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  {m === "call" ? <Phone className="w-3 h-3" /> : <MessageCircle className="w-3 h-3" />}
                  {m}
                </button>
              ))}
            </div>

            {mode === "call" && !isCallActive && (
              <Button onClick={startCall} size="sm" className="rounded-xl gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Phone className="w-3.5 h-3.5" /> Start Call
              </Button>
            )}
            {mode === "call" && isCallActive && (
              <Button onClick={endCall} size="sm" variant="destructive" className="rounded-xl gap-1.5">
                <PhoneOff className="w-3.5 h-3.5" /> End Call
              </Button>
            )}
          </div>
        </div>

        {/* No persona state */}
        {!selectedPersona && (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary/60" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No personality found</p>
              <p className="text-muted-foreground text-sm mt-1">Create a personality first to start a conversation.</p>
            </div>
            <Button onClick={() => navigate("/dashboard/create-personality")} className="rounded-2xl gap-2">
              Create Personality
            </Button>
          </div>
        )}

        {/* Messages */}
        {selectedPersona && (
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-48 text-center gap-3 opacity-60">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-primary/80">{selectedPersona.name?.[0] ?? "A"}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedPersona.name || "AI Replica"}</p>
                  <p className="text-xs text-muted-foreground">{mode === "call" ? "Press 'Start Call' to connect" : "Send a message to begin"}</p>
                </div>
              </div>
            )}

            {messages.map(msg => (
              <div
                key={msg.id}
                className={cn("flex gap-3", msg.type === "user" ? "justify-end" : "justify-start")}
              >
                {/* AI avatar */}
                {msg.type === "ai" && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-black text-primary">{selectedPersona.name?.[0] ?? "A"}</span>
                  </div>
                )}

                <div className={cn("max-w-[75%] space-y-1", msg.type === "user" ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "px-4 py-3 rounded-2xl text-sm leading-relaxed",
                      msg.type === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-card border border-border/50 text-foreground rounded-tl-sm backdrop-blur-sm"
                    )}
                  >
                    {msg.content || (
                      <div className="flex gap-1 items-center py-0.5">
                        {[0, 1, 2].map(i => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Play button for AI messages */}
                  {msg.type === "ai" && msg.content && selectedPersona.voice_id && (
                    <button
                      onClick={() => speakText(msg.content, msg.id)}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors ml-1"
                    >
                      {msg.audioState === "loading" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : msg.audioState === "playing" ? (
                        <Volume2 className="w-3 h-3 text-primary animate-pulse" />
                      ) : (
                        <Volume2 className="w-3 h-3" />
                      )}
                      {msg.audioState === "playing" ? "Playing" : "Play"}
                    </button>
                  )}
                </div>

                {/* User avatar */}
                {msg.type === "user" && (
                  <div className="w-8 h-8 rounded-full bg-muted border border-border/50 flex items-center justify-center flex-shrink-0 mt-1">
                    <User className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-black text-primary">{selectedPersona.name?.[0] ?? "A"}</span>
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm px-4 py-3">
                  <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* Chat input */}
        {selectedPersona && mode === "chat" && (
          <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-border/30">
            <div className="flex gap-2 items-end bg-card border border-border/50 rounded-2xl p-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder={`Message ${selectedPersona.name || "AI Replica"}...`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none px-2 py-1 max-h-32"
                style={{ scrollbarWidth: "thin" }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isTyping}
                className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all",
                  input.trim() && !isTyping ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-95" : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
              >
                {isTyping ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* Call mode bottom bar */}
        {selectedPersona && mode === "call" && !isCallActive && (
          <div className="px-4 pb-4 pt-2 flex-shrink-0 border-t border-border/30">
            <button
              onClick={startCall}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition-all shadow-lg"
            >
              <Phone className="w-4 h-4" /> Start Voice Call
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
