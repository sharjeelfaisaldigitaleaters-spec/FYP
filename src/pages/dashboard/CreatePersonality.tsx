import { useState, useEffect, useRef, useCallback } from "react";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Sparkles, ArrowRight, Save, CheckCircle2,
  Mic, Square, Trash2, Loader2, AlertCircle, RefreshCw,
  SkipForward, Upload, Volume2, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate, useParams } from "react-router-dom";

// ─── Survey Questions (35 total) ──────────────────────────────────────────────

interface SurveyQuestion {
  id: number;
  question: string;
  options: string[];
  placeholder?: string;
}

const surveyQuestions: SurveyQuestion[] = [
  // Life & Background (Q1–Q25)
  { id: 1, question: "What was their full name, and what nickname did you call them?", options: [], placeholder: "e.g. Muhammad Arif, we called him Abbu" },
  { id: 2, question: "Can you share a childhood memory or story they often told?", options: ["Playing in the local neighborhood streets and fields.", "Climbing trees and stealing fruits from orchards.", "Getting caught in the rain or getting into silly mischief.", "Helping their family at a farm, shop, or home.", "Struggling or migrating during difficult times."] },
  { id: 3, question: "What was the greatest day of their life, and what made it so special?", options: ["Their wedding day, celebrating with friends and family.", "The birth of their first child or grandchild.", "Graduation day or securing their dream job.", "Buying their first home or starting a business.", "A special family reunion or trip."] },
  { id: 4, question: "What achievement were they most proud of in their life?", options: ["Raising their children and seeing them succeed.", "Overcoming financial struggles and providing for the family.", "Their career progression and professional achievements.", "Building a home and supporting the local community.", "Their education or creative pursuits (art, writing, poetry)."] },
  { id: 5, question: "Was there a particular habit they had that made them stand out from others?", options: ["Always humming or singing a specific tune.", "Checking on everyone before going to sleep.", "Waking up incredibly early and sitting with a cup of tea.", "Using specific funny catchphrases in conversations.", "Always carrying a small notebook, pocket watch, or item."] },
  { id: 6, question: "What was their daily routine like, and what time did they usually wake up?", options: ["Early riser (5 AM - 6 AM), morning prayers, and physical work.", "Moderate schedule (7 AM - 8 AM), standard work day, and evening family time.", "Night owl, staying up late reading or working, waking up late.", "Relaxed retirement routine, sitting in the garden, meeting friends."] },
  { id: 7, question: "What was their absolute favorite food and beverage?", options: ["Traditional homemade dishes (Biryani, Nihari, Daal Chawal).", "Fresh tea (Chai) or coffee with biscuits.", "Sweet desserts (Kheer, Gulab Jamun, Halwa).", "Simple vegetables, flatbread (Roti), and yogurt/lassi."] },
  { id: 8, question: "What kind of things made them get angry the most, and how did they handle their anger?", options: ["Dishonesty or disrespect; they would go silent and walk away.", "Laziness or broken promises; they would speak firmly and directly.", "Unfair treatment of others; they would argue passionately for justice.", "They rarely got angry and preferred to keep the peace."] },
  { id: 9, question: "What were their favorite book, movie, or song?", options: ["Classic poetry or religious texts.", "Old classical music, Ghazals, or folk songs.", "Historical drama films or classic cinema.", "News, newspapers, and biography books."] },
  { id: 10, question: "Where did they receive their education, and what was their field of study?", options: ["Self-educated or primary schooling with vast practical wisdom.", "High school education with focus on general studies.", "College / University degree in arts, humanities, or language.", "Professional degree in science, engineering, law, or medicine."] },
  { id: 11, question: "What was their profession, and what were some of their major accomplishments in their career?", options: ["Government or public service, helping citizens.", "Business owner, entrepreneur, or trader.", "Teacher, educator, or academic guide.", "Homemaker, keeping the family organized and running.", "Agriculture, farming, or skilled craftsmanship."] },
  { id: 12, question: "What was their most peaceful and relaxing moment in life?", options: ["Sitting in the garden at sunset with a warm cup of tea.", "Listening to rain falling outside while reading.", "Spending quiet time in early morning prayers or meditation.", "Being surrounded by kids and grandkids laughing."] },
  { id: 13, question: "How did they treat and interact with their friends and family?", options: ["Warm, affectionate, and always checking on everyone's well-being.", "Quiet, reserved, showing love through actions rather than words.", "Jovial, teasing, always cracking jokes and keeping the mood light.", "Disciplined, protective, acting as a strong pillar of support."] },
  { id: 14, question: "What type of weather or environment did they enjoy spending time in the most?", options: ["Cool rainy days (Barsaat) with a breeze.", "Warm sunny afternoons in the winter sun.", "Crisp cool mountain breeze or rural village green fields.", "The comfort of their own cozy living room."] },
  { id: 15, question: "Did they have any unusual skills or hidden talents they frequently mentioned?", options: ["A beautiful singing or reciting voice (Ghazals/Naats).", "Incredible memory for dates, history, and poetry.", "Repairing anything broken around the house.", "Expert gardening or plant care.", "An amazing ability to tell captivating stories."] },
  { id: 16, question: "What was usually on their mind, and what were their biggest dreams?", options: ["Securing a bright and stable future for their children.", "Traveling to sacred or historical places.", "Living a peaceful, honest life free of debts.", "Seeing their family stay united and successful."] },
  { id: 17, question: "What was their biggest regret in life?", options: ["Not being able to pursue higher education.", "Not spending enough time with family during busy work years.", "Not traveling or exploring the world more.", "An opportunity they passed up in their youth.", "They lived with no regrets, accepting life as it came."] },
  { id: 18, question: "How did they typically approach and overcome challenges or difficulties?", options: ["With deep faith, patience (Sabr), and prayer.", "Through sheer determination, hard work, and logic.", "By consulting family and finding a solution together.", "Maintaining a positive attitude and smiling through the pain."] },
  { id: 19, question: "What did friendship and love mean to them personally?", options: ["Absolute loyalty, standing by someone in hard times.", "Selfless sacrifice and putting others' needs first.", "Deep companionship, quiet understanding, and trust.", "Respect, mutual support, and sharing life's burdens."] },
  { id: 20, question: "Is there a specific conversation with them that remains close to your heart?", options: [], placeholder: "Describe it in as much detail as you remember..." },
  { id: 21, question: "Did they hold any strong religious or philosophical beliefs that guided their life?", options: ["Deeply religious, guided by daily prayers and sacred scriptures.", "Philosophical, believing in karma, kindness, and humanity above all.", "Simple moral code: speak the truth, work hard, and harm no one.", "Traditional and cultural values passed down by ancestors."] },
  { id: 22, question: "How did they wish to be remembered by the people they loved?", options: ["As a kind, loving, and generous soul.", "As a strong, honest, and hardworking person who never gave up.", "As someone who brought joy, laughter, and light to the family.", "As a wise guide who always pointed them in the right direction."] },
  { id: 23, question: "What was the funniest or most humorous moment you remember experiencing with them?", options: [], placeholder: "Describe the moment..." },
  { id: 24, question: "What values or lessons did they try to pass on to others?", options: ["Patience, kindness, and empathy toward everyone.", "Honesty, integrity, and keeping one's word.", "Self-reliance, hard work, and education.", "Staying close to family and protecting relationships."] },
  { id: 25, question: "If they could send a final message to the world today, what do you think it would be?", options: ["Love one another, forgive easily, and live in peace.", "Work hard, stay honest, and face life with courage.", "Take care of your family; they are your true wealth.", "Trust in God's plan, keep smiling, and don't worry."] },

  // === SPEECH & PERSONALITY DNA (Q26–Q35) ===
  { id: 26, question: "How did they typically address or call you in conversation?", options: ["By my first name directly.", "By a special nickname they gave me.", "With a term of endearment (e.g., beta, jaan, mera bacha, champ).", "They used formal titles or avoided direct address."], placeholder: "Or write the exact word/nickname they used for you..." },
  { id: 27, question: "How would you describe their overall speaking style?", options: ["Very casual and relaxed — like talking to a close friend.", "Formal and composed — always proper and measured.", "A mix of both — casual with trusted people, formal otherwise.", "Poetic or philosophical — always finding deeper meaning in words."] },
  { id: 28, question: "Did they have any signature phrases, expressions, or words they used constantly?", options: [], placeholder: "e.g. 'Arrey yaar', 'Allah ka shukar hai', 'Dekh bhai', 'Chalo theek hai', 'Sun meri baat'..." },
  { id: 29, question: "How was their sense of humor?", options: ["Sharp and witty — quick comebacks and clever wordplay.", "Silly and lighthearted — loved silly jokes and puns.", "Dry and deadpan — funny without even smiling.", "Warm and wholesome — gentle humor that made everyone comfortable.", "They were mostly serious and did not joke much."] },
  { id: 30, question: "How did they react or express themselves when they were happy or excited?", options: ["Laughed loudly and openly, filling the room.", "Got very talkative and energetic, telling stories.", "Smiled quietly and became extra warm and affectionate.", "Showed happiness through actions — hugs, cooking favorite food, small gifts."] },
  { id: 31, question: "How did they sound or behave when they were worried, serious, or giving important advice?", options: ["Spoke slowly and deliberately, choosing every word carefully.", "Went quiet first, then spoke with deep seriousness.", "Became direct and firm — straight to the point, no fluff.", "Used stories or analogies to explain their concern indirectly."] },
  { id: 32, question: "Were they more of a listener or a talker in conversations?", options: ["Mostly a listener — absorbed everything before responding.", "A talker — loved sharing stories, opinions, and advice.", "Balanced — listened well and spoke when they had something meaningful to say.", "It depended: quiet with strangers, very talkative with loved ones."] },
  { id: 33, question: "What topics did they absolutely love talking about and could go on forever?", options: ["Family history, ancestry, and how things used to be.", "Politics, current events, and world affairs.", "Religion, spirituality, and the meaning of life.", "Their own work, career, or field of expertise.", "Practical life advice, money, and planning for the future."], placeholder: "Or write specific topics they loved..." },
  { id: 34, question: "What topics made them uncomfortable, go quiet, or change the subject?", options: ["Their age or health.", "Past mistakes or painful memories.", "Money and financial struggles.", "Conflict within the family.", "They were open about everything — no topic was off-limits."] },
  { id: 35, question: "In one sentence, how would YOU describe their personality to a complete stranger?", options: [], placeholder: "e.g. 'He was the kind of man who made everyone feel safe and valued just by being in the room'..." },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type CloneStatus = "idle" | "cloning" | "verifying" | "testing" | "success" | "error";
type PageStep = 1 | 2;

interface RecordedClip {
  id: string;
  blob: Blob;
  url: string;
  duration: number;
  name: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CreatePersonality() {
  const navigate = useNavigate();
  const { personaId: routePersonaId } = useParams<{ personaId?: string }>();

  const [step, setStep] = useState<PageStep>(1);
  const [personaName, setPersonaName] = useState("");
  const [relation, setRelation] = useState("");
  const [answers, setAnswers] = useState<Record<number, { type: "preset" | "custom"; text: string }>>({});
  const [saving, setSaving] = useState(false);
  const [savedPersonaId, setSavedPersonaId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [existingVoiceId, setExistingVoiceId] = useState<string | null>(null);

  // Voice clone state
  const [recordedClips, setRecordedClips] = useState<RecordedClip[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [cloneStatus, setCloneStatus] = useState<CloneStatus>("idle");
  const [clonedVoiceId, setClonedVoiceId] = useState<string | null>(null);
  const [cloneError, setCloneError] = useState("");
  const [testAudio, setTestAudio] = useState<string | null>(null);
  const [testPlaying, setTestPlaying] = useState(false);

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [waveformBars, setWaveformBars] = useState<number[]>(Array(40).fill(5));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const recordTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);

  const answeredCount = Object.values(answers).filter(a => a.text.trim()).length;
  const progressPercent = Math.round((answeredCount / surveyQuestions.length) * 100);
  const totalRecordedSeconds = recordedClips.reduce((acc, c) => acc + c.duration, 0);

  // Load an existing persona only when editing one (route has a personaId);
  // otherwise this is a brand new personality and the form starts blank.
  useEffect(() => {
    async function loadPersona() {
      if (!routePersonaId) {
        setIsLoaded(true);
        return;
      }
      try {
        const p = await fetchApi(`/conversation/personas/${routePersonaId}`);
        setPersonaName(p.name || "");
        setRelation(p.relation || "");
        setSavedPersonaId(p.id);
        const vid = p.voice_id;
        if (vid && vid.length > 10) {
          setExistingVoiceId(vid);
          setClonedVoiceId(vid);
          setCloneStatus("success");
        }
        if (p.survey_data) {
          const raw = typeof p.survey_data === "string" ? JSON.parse(p.survey_data) : p.survey_data;
          const loaded: typeof answers = {};
          surveyQuestions.forEach(q => {
            const ans = raw[q.question];
            if (ans) loaded[q.id] = { type: q.options.includes(ans) ? "preset" : "custom", text: ans };
          });
          setAnswers(loaded);
        }
      } catch (err) {
        console.error("Failed to load persona:", err);
        toast.error("Could not load that personality.");
      } finally {
        setIsLoaded(true);
      }
    }
    loadPersona();
  }, [routePersonaId]);

  const handleSelectOption = (qId: number, option: string) =>
    setAnswers(prev => ({ ...prev, [qId]: { type: "preset", text: option } }));

  const handleCustomText = (qId: number, text: string) =>
    setAnswers(prev => ({ ...prev, [qId]: { type: "custom", text } }));

  const handleSave = async () => {
    if (!personaName.trim()) { toast.error("Please enter the person's name."); return; }
    if (!relation.trim()) { toast.error("Please enter their relation to you."); return; }
    setSaving(true);
    const survey: Record<string, string> = {};
    surveyQuestions.forEach(q => {
      const ans = answers[q.id];
      if (ans?.text.trim()) survey[q.question] = ans.text;
    });
    try {
      const result = await fetchApi("/conversation/personas", {
        method: "POST",
        body: JSON.stringify({
          name: personaName,
          relation,
          voice_id: existingVoiceId,
          survey_data: survey,
          persona_id: savedPersonaId || undefined,
        })
      });
      setSavedPersonaId(result.id);
      setShowActionModal(true);
      // The survey is saved to the backend now — reset the visible form right
      // away so a second personality can be started immediately. savedPersonaId
      // (used by the voice-clone step that follows) is left untouched.
      resetSurveyFields();
    } catch (err: any) {
      toast.error(err.message || "Failed to save personality.");
    } finally {
      setSaving(false);
    }
  };

  // ── Voice Recording ──────────────────────────────────────────────────────────

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);
      analyserRef.current = analyser;

      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];
      mr.ondataavailable = e => audioChunksRef.current.push(e.data);
      mr.onstop = () => { stream.getTracks().forEach(t => t.stop()); audioCtx.close(); };
      mr.start(100);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordTimerRef.current = setInterval(() => setRecordingSeconds(s => s + 1), 1000);

      const drawBars = () => {
        if (!analyserRef.current) return;
        const data = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(data);
        const bars = Array.from(data.slice(0, 40)).map(v => Math.max(4, (v / 255) * 100));
        setWaveformBars(bars);
        animFrameRef.current = requestAnimationFrame(drawBars);
      };
      drawBars();
    } catch {
      toast.error("Microphone access denied. Please allow microphone in browser settings.");
      setCountdown(null);
    }
  }, []);

  const startCountdown = useCallback(() => {
    if (recordedClips.length >= 3) { toast.error("Maximum 3 clips. Delete one first."); return; }
    setCountdown(3);
    let count = 3;
    const iv = setInterval(() => {
      count--;
      if (count <= 0) { clearInterval(iv); setCountdown(null); startRecording(); }
      else setCountdown(count);
    }, 1000);
  }, [recordedClips.length, startRecording]);

  const stopRecording = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    setIsRecording(false);
    setWaveformBars(Array(40).fill(5));

    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;

    const capturedSeconds = recordingSeconds;
    mr.onstop = () => {
      const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      const clipId = Math.random().toString(36).slice(2);
      setRecordedClips(prev => [...prev, {
        id: clipId, blob, url,
        duration: capturedSeconds,
        name: `Clip ${prev.length + 1}`
      }]);
    };
    mr.stop();
  }, [recordingSeconds]);

  const deleteClip = (id: string) => {
    setRecordedClips(prev => {
      const clip = prev.find(c => c.id === id);
      if (clip) URL.revokeObjectURL(clip.url);
      return prev.filter(c => c.id !== id);
    });
  };

  const handleClone = async () => {
    if (!savedPersonaId) { toast.error("Save the personality survey first."); return; }
    const hasAudio = recordedClips.length > 0 || uploadedFiles.length > 0;
    if (!hasAudio) { toast.error("Please record or upload at least one audio clip."); return; }

    setCloneStatus("cloning");
    setCloneError("");

    try {
      const formData = new FormData();
      formData.append("persona_id", savedPersonaId);
      formData.append("voice_name", personaName || "AI Replica");
      recordedClips.forEach((clip, i) => formData.append("audio_files", clip.blob, `recording_${i + 1}.webm`));
      uploadedFiles.forEach(f => formData.append("audio_files", f, f.name));

      const token = localStorage.getItem("mk_access_token");
      const res = await fetch(`${API_BASE_URL}/conversation/clone-voice`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        let errMsg = "Voice cloning failed.";
        if (typeof err.detail === "string") {
          errMsg = err.detail;
        } else if (Array.isArray(err.detail)) {
          errMsg = err.detail.map((d: any) => d.msg || JSON.stringify(d)).join(", ");
        } else if (err.detail && typeof err.detail === "object") {
          errMsg = JSON.stringify(err.detail);
        }
        throw new Error(errMsg);
      }

      const data = await res.json();
      setClonedVoiceId(data.voice_id);
      setCloneStatus("verifying");

      // Fetch test audio sample
      try {
        const testData = await fetchApi("/conversation/speak-test", {
          method: "POST",
          body: JSON.stringify({ persona_id: savedPersonaId })
        });
        if (testData?.audio) setTestAudio(testData.audio);
      } catch { /* non-fatal */ }

      setCloneStatus("testing");

    } catch (err: any) {
      setCloneStatus("error");
      setCloneError(err.message || "Failed to clone voice.");
    }
  };

  const resetSurveyFields = () => {
    setPersonaName("");
    setRelation("");
    setAnswers({});
  };

  const playTestAudio = () => {
    if (!testAudio) return;
    if (testAudioRef.current) { testAudioRef.current.pause(); testAudioRef.current = null; }
    const bytes = Uint8Array.from(atob(testAudio), c => c.charCodeAt(0));
    const blob = new Blob([bytes], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    testAudioRef.current = audio;
    setTestPlaying(true);
    audio.onended = () => { setTestPlaying(false); URL.revokeObjectURL(url); };
    audio.play().catch(() => setTestPlaying(false));
  };

  const handleRetryVoice = async () => {
    if (!savedPersonaId || !clonedVoiceId) return;
    try {
      const token = localStorage.getItem("mk_access_token");
      await fetch(`${API_BASE_URL}/conversation/clone-voice/${clonedVoiceId}?persona_id=${savedPersonaId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch { /* ignore */ }
    setClonedVoiceId(null);
    setCloneStatus("idle");
    setTestAudio(null);
    setRecordedClips([]);
    setUploadedFiles([]);
    setCloneError("");
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground mb-1">Create Personality</h1>
        <p className="text-muted-foreground text-sm">Build a digital personality from memory and voice.</p>
      </div>

      {/* Step tabs */}
      <div className="flex items-center gap-0 mb-8 bg-muted rounded-2xl p-1">
        {([{ n: 1 as PageStep, label: "Survey" }, { n: 2 as PageStep, label: "Voice Clone" }]).map(tab => (
          <button
            key={tab.n}
            onClick={() => {
              if (tab.n === 2 && !savedPersonaId) { toast.error("Save the survey first."); return; }
              setStep(tab.n);
            }}
            className={cn(
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all",
              step === tab.n ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.n}. {tab.label}
          </button>
        ))}
      </div>

      {/* ── STEP 1: SURVEY ── */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Name + Relation */}
          <div className="bg-card border border-border/50 rounded-2xl p-5 space-y-4">
            <h2 className="font-semibold text-foreground text-base">Basic Info</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Full Name *</label>
                <input
                  value={personaName}
                  onChange={e => setPersonaName(e.target.value)}
                  placeholder="e.g. Muhammad Arif"
                  className="w-full px-3 py-2.5 text-sm bg-muted/40 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Relation to You *</label>
                <input
                  value={relation}
                  onChange={e => setRelation(e.target.value)}
                  placeholder="e.g. Father, Myself, Best Friend"
                  className="w-full px-3 py-2.5 text-sm bg-muted/40 border border-border/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
                />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">{answeredCount}/{surveyQuestions.length} answered</span>
          </div>

          {/* Survey sections */}
          {[
            { title: "Life & Background", color: "text-amber-400", ids: Array.from({ length: 25 }, (_, i) => i + 1) },
            { title: "Speech & Personality DNA", color: "text-violet-400", ids: Array.from({ length: 10 }, (_, i) => i + 26) },
          ].map(section => (
            <div key={section.title} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border/50" />
                <span className={cn("text-xs font-bold uppercase tracking-widest px-3", section.color)}>{section.title}</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              {section.ids.map(id => {
                const q = surveyQuestions.find(sq => sq.id === id)!;
                const ans = answers[id];
                return (
                  <div key={id} className="bg-card border border-border/50 rounded-2xl p-5 space-y-3">
                    <p className="text-sm font-semibold text-foreground leading-relaxed">
                      <span className="text-primary mr-2 font-mono text-xs">{id}.</span>{q.question}
                    </p>
                    {q.options.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        {q.options.map(opt => (
                          <button
                            key={opt}
                            onClick={() => handleSelectOption(id, opt)}
                            className={cn(
                              "text-left text-xs px-3.5 py-2.5 rounded-xl border transition-all",
                              ans?.text === opt && ans?.type === "preset"
                                ? "border-primary bg-primary/10 text-primary font-semibold"
                                : "border-border/40 hover:border-primary/50 text-muted-foreground hover:text-foreground"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                    <Textarea
                      value={ans?.type === "custom" ? ans.text : ""}
                      onChange={e => handleCustomText(id, e.target.value)}
                      onFocus={() => { if (ans?.type !== "custom") handleCustomText(id, ""); }}
                      placeholder={q.placeholder || "Write your own answer..."}
                      className="text-xs min-h-[64px] bg-muted/40 border-border/50 rounded-xl resize-none"
                    />
                  </div>
                );
              })}
            </div>
          ))}

          <div className="flex justify-end pt-4">
            <Button onClick={handleSave} disabled={saving} size="lg" className="rounded-2xl px-8 gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Saving..." : "Save Personality"}
            </Button>
          </div>
        </div>
      )}

      {/* ── STEP 2: VOICE CLONE ── */}
      {step === 2 && (
        <div className="space-y-6">

          {/* ── Voice Cloning / Verifying Loading Screen ── */}
          {(cloneStatus === "cloning" || cloneStatus === "verifying") && (
            <div className="bg-card border border-border/50 rounded-3xl p-10 text-center space-y-7">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-primary/15 border-2 border-primary/40 flex items-center justify-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {cloneStatus === "cloning" ? "Cloning Your Voice..." : "Verifying Voice Sample..."}
                </h2>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                  {cloneStatus === "cloning"
                    ? "Sending your audio samples to ElevenLabs and building the voice model. This usually takes 20–60 seconds — please don't close this page."
                    : "Generating a short test sample so you can hear how it sounds."}
                </p>
              </div>
            </div>
          )}

          {/* ── Voice Test Screen (post-clone) */}
          {cloneStatus === "testing" && (
            <div className="bg-card border border-border/50 rounded-3xl p-10 text-center space-y-7">
              {/* Success icon */}
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-center">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Voice Clone Ready!</h2>
                <p className="text-muted-foreground text-sm">Listen to a sample — does it sound like them?</p>
              </div>

              {testAudio ? (
                <button
                  onClick={playTestAudio}
                  disabled={testPlaying}
                  className="mx-auto flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all"
                >
                  {testPlaying ? (
                    <div className="flex gap-0.5 items-end h-6">
                      {Array(10).fill(0).map((_, i) => (
                        <div
                          key={i}
                          className="w-1 bg-primary rounded-full animate-bounce"
                          style={{ height: `${Math.sin(i * 0.8) * 10 + 14}px`, animationDelay: `${i * 70}ms` }}
                        />
                      ))}
                    </div>
                  ) : <Volume2 className="w-5 h-5 text-primary" />}
                  <span className="text-sm font-semibold text-primary">
                    {testPlaying ? "Playing sample..." : "▶  Play Test Sample"}
                  </span>
                </button>
              ) : (
                <p className="text-xs text-muted-foreground">Test audio unavailable — you can still proceed.</p>
              )}

              <div className="flex flex-col gap-3 max-w-xs mx-auto pt-2">
                <Button onClick={() => navigate("/dashboard/conversation")} size="lg" className="rounded-2xl gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Sounds Good — Start Conversation
                </Button>
                <Button onClick={handleRetryVoice} variant="outline" className="rounded-2xl gap-2">
                  <RefreshCw className="w-4 h-4" /> Try Again — Re-record Voice
                </Button>
                <button
                  onClick={() => navigate("/dashboard/conversation")}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-2"
                >
                  <SkipForward className="w-3 h-3" /> Skip & Start Conversation
                </button>
              </div>
            </div>
          )}

          {/* ── Existing voice banner */}
          {cloneStatus === "success" && existingVoiceId && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-5 flex items-center gap-4">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Voice clone is active</p>
                <p className="text-xs text-muted-foreground mt-0.5">You can replace it by recording new clips below.</p>
              </div>
              <Button size="sm" onClick={() => navigate("/dashboard/conversation")} className="rounded-xl gap-1">
                Start Talking <ChevronRight className="w-3 h-3" />
              </Button>
            </div>
          )}

          {/* ── Error banner */}
          {cloneStatus === "error" && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">Voice Setup Failed</p>
                <p className="text-xs text-red-400 mt-1">{cloneError}</p>
              </div>
              <button onClick={() => setCloneStatus("idle")} className="text-muted-foreground hover:text-foreground">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── Recording UI */}
          {(cloneStatus === "idle" || cloneStatus === "error" || cloneStatus === "success") && (
            <>
              <div className="bg-card border border-border/50 rounded-3xl p-8 text-center space-y-7">
                <div>
                  <h2 className="text-lg font-bold text-foreground mb-1">Record Voice Samples</h2>
                  <p className="text-muted-foreground text-xs">Record 1–3 clips. Speak naturally for at least 10 seconds each.</p>
                </div>

                {/* Waveform visualizer while recording */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-0.5 h-16 px-4">
                    {waveformBars.map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 max-w-[6px] bg-gradient-to-t from-primary to-violet-400 rounded-full transition-all duration-75"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                )}

                {/* Countdown */}
                {countdown !== null && (
                  <div className="w-28 h-28 mx-auto rounded-full bg-primary/10 border-2 border-primary/40 flex items-center justify-center">
                    <span className="text-5xl font-black text-primary">{countdown}</span>
                  </div>
                )}

                {/* Mic Button */}
                {countdown === null && (
                  <div className="flex flex-col items-center gap-3">
                    <button
                      onClick={isRecording ? stopRecording : startCountdown}
                      disabled={!isRecording && recordedClips.length >= 3}
                      className={cn(
                        "relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 select-none",
                        isRecording
                          ? "bg-red-500 shadow-[0_0_50px_rgba(239,68,68,0.5)] scale-110"
                          : recordedClips.length >= 3
                          ? "bg-muted cursor-not-allowed opacity-50"
                          : "bg-primary shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95"
                      )}
                    >
                      {isRecording
                        ? <Square className="w-9 h-9 text-white fill-white" />
                        : <Mic className="w-9 h-9 text-primary-foreground" />
                      }
                      {isRecording && (
                        <>
                          <span className="absolute -top-9 left-1/2 -translate-x-1/2 text-sm text-red-500 font-bold tabular-nums">
                            {Math.floor(recordingSeconds / 60).toString().padStart(2, "0")}:{(recordingSeconds % 60).toString().padStart(2, "0")}
                          </span>
                          <span className="absolute inset-0 rounded-full border-2 border-red-400 animate-ping opacity-60" />
                        </>
                      )}
                    </button>
                    <p className="text-xs text-muted-foreground">
                      {isRecording ? "Tap to stop" : recordedClips.length >= 3 ? "Max 3 clips reached" : "Tap to record"}
                    </p>
                  </div>
                )}

                {/* Clips list */}
                {recordedClips.length > 0 && (
                  <div className="space-y-2 text-left mt-2">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Recorded Clips — {totalRecordedSeconds}s total
                    </p>
                    {recordedClips.map(clip => (
                      <div key={clip.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Mic className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-foreground">{clip.name}</p>
                          <audio src={clip.url} controls className="h-7 w-full mt-1" />
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{clip.duration}s</span>
                        <button onClick={() => deleteClip(clip.id)} className="text-muted-foreground hover:text-red-500 transition-colors ml-1">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* File upload */}
              <div
                className="border border-dashed border-border/50 hover:border-primary/40 rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-6 h-6 text-muted-foreground mx-auto" />
                <p className="text-xs text-muted-foreground">Or upload audio files (MP3, WAV, M4A, FLAC)</p>
                <p className="text-xs text-primary font-semibold">Browse Files</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  multiple
                  className="hidden"
                  onChange={e => { if (e.target.files) setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)].slice(0, 5)); }}
                />
                {uploadedFiles.length > 0 && (
                  <div className="space-y-1 mt-2 text-left">
                    {uploadedFiles.map((f, i) => (
                      <div key={i} className="flex items-center justify-between text-xs text-muted-foreground px-2 py-1 bg-muted/40 rounded-lg">
                        <span className="truncate flex-1">{f.name}</span>
                        <button onClick={e => { e.stopPropagation(); setUploadedFiles(prev => prev.filter((_, j) => j !== i)); }} className="hover:text-red-500 ml-2">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleClone}
                disabled={cloneStatus === "cloning" || (recordedClips.length === 0 && uploadedFiles.length === 0)}
                size="lg"
                className="w-full rounded-2xl gap-2"
              >
                {cloneStatus === "cloning"
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Cloning Voice with ElevenLabs...</>
                  : <><Sparkles className="w-4 h-4" /> Clone Voice</>
                }
              </Button>
            </>
          )}
        </div>
      )}

      {/* Action modal after save */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Personality Saved!</h2>
              <p className="text-muted-foreground text-sm">What would you like to do next?</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={() => { setShowActionModal(false); setStep(2); }} className="rounded-2xl gap-2">
                <Mic className="w-4 h-4" /> Set Up Voice Clone
              </Button>
              <button
                onClick={() => { setShowActionModal(false); navigate("/dashboard/conversation"); }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1 py-1"
              >
                <ArrowRight className="w-3 h-3" /> Skip Voice & Go to Conversation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
