import { useState, useRef, useEffect } from "react";
import { Upload, Mic, FileText, Image, File as FileIcon, X, Check, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";

type Tab = "audio" | "image" | "text" | "document";

const tabs: { id: Tab; label: string; icon: typeof Mic; desc: string }[] = [
  { id: "audio", label: "Voice Recording", icon: Mic, desc: "MP3, WAV, M4A — up to 500 MB" },
  { id: "image", label: "Photo / Video", icon: Image, desc: "JPG, PNG, MP4 — up to 2 GB" },
  { id: "text", label: "Written Memory", icon: FileText, desc: "Stories, letters, diary entries" },
  { id: "document", label: "Document (PDF)", icon: FileIcon, desc: "Letters, journals, biographies as PDF" },
];

interface Persona {
  id: string;
  name: string;
  relation: string;
}

export default function UploadMemory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoaded, setPersonasLoaded] = useState(false);
  const [personaId, setPersonaId] = useState<string>("");

  const [activeTab, setActiveTab] = useState<Tab>("audio");
  const [dragging, setDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [textContent, setTextContent] = useState("");
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success">("idle");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadPersonas() {
      try {
        const data = await fetchApi("/conversation/personas");
        setPersonas(data || []);
        const fromQuery = searchParams.get("persona");
        if (fromQuery && data?.some((p: Persona) => p.id === fromQuery)) {
          setPersonaId(fromQuery);
        } else if (data && data.length > 0) {
          setPersonaId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to load personalities:", err);
      } finally {
        setPersonasLoaded(true);
      }
    }
    loadPersonas();
  }, [searchParams]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dropped = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...dropped]);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!personaId) { toast.error("Please select which personality this memory belongs to."); return; }
    if (!title.trim()) { toast.error("Please add a title for this memory."); return; }
    if (activeTab !== "text" && files.length === 0) { toast.error("Please add at least one file."); return; }
    if (activeTab === "text" && !textContent.trim()) { toast.error("Please write your memory."); return; }

    setStatus("uploading");

    try {
      if (activeTab === "text") {
        await fetchApi("/upload/text", {
          method: "POST",
          body: JSON.stringify({
            title,
            content: textContent,
            persona_id: personaId,
          }),
        });
        setProgress(100);
      } else if (activeTab === "document") {
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("title", `${title} ${files.length > 1 ? `(Part ${i + 1})` : ""}`.trim());
          formData.append("persona_id", personaId);
          formData.append("file", file);

          await fetchApi("/upload/document", {
            method: "POST",
            body: formData,
          });

          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
      } else {
        // Upload files one by one
        const endpoint = activeTab === "audio" ? "/upload/audio" : "/upload/media";

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const formData = new FormData();
          formData.append("title", `${title} ${files.length > 1 ? `(Part ${i + 1})` : ""}`.trim());
          formData.append("persona_id", personaId);
          formData.append("file", file);

          await fetchApi(endpoint, {
            method: "POST",
            body: formData,
          });

          setProgress(Math.round(((i + 1) / files.length) * 100));
        }
      }

      setStatus("success");
      toast.success("Memory uploaded! Your personality now knows about it.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload memory.");
      setStatus("idle");
      setProgress(0);
    }
  };

  const handleSaveDraft = () => {
    // We could store drafts locally or in the backend.
    // Since backend draft logic is not built yet, mock it with toast.
    toast.success("Draft saved locally (Coming soon).");
  };

  const handleReset = () => {
    setFiles([]);
    setTitle("");
    setTextContent("");
    setProgress(0);
    setStatus("idle");
  };

  if (personasLoaded && personas.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl bg-card border border-border/50 shadow-elevated p-12 text-center">
          <div className="w-16 h-16 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Build a Personality First</h2>
          <p className="text-muted-foreground mb-8 text-sm">
            Memories belong to a specific personality — create one before uploading anything for it to remember.
          </p>
          <Button variant="hero" size="lg" onClick={() => navigate("/dashboard/create-personality")}>
            Create Personality <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rounded-3xl bg-card border border-border/50 shadow-elevated p-12 text-center">
          <div className="w-20 h-20 rounded-2xl accent-gradient flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-primary-foreground" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground mb-3">Memory Uploaded!</h2>
          <p className="text-muted-foreground mb-2">
            <span className="font-medium text-foreground">"{title}"</span> is now being processed.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            It's tied to this personality only — other personalities you've built won't know about it.
          </p>
          <div className="h-2 bg-secondary rounded-full overflow-hidden mb-8">
            <div className="h-full accent-gradient rounded-full w-full" style={{ width: "100%" }} />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard/library">
                View Story Library <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" onClick={handleReset}>
              Upload Another
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Upload a Memory</h1>
        <p className="text-muted-foreground">Share voice recordings, photos, written stories, or documents to preserve forever.</p>
      </div>

      {/* Persona selector */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-5">
        <label className="block text-sm font-medium text-foreground mb-2">Which personality is this memory for? *</label>
        <select
          value={personaId}
          onChange={(e) => setPersonaId(e.target.value)}
          className="w-full h-12 rounded-xl border border-input bg-background px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
        >
          {personas.map((p) => (
            <option key={p.id} value={p.id}>{p.name} ({p.relation})</option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground mt-2">
          This memory will only inform this personality's knowledge of itself — it stays separate from your other personalities.
        </p>
      </div>

      {/* Tab selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActiveTab(t.id); setFiles([]); }}
            className={cn(
              "p-4 rounded-2xl border text-left transition-all duration-200",
              activeTab === t.id
                ? "accent-gradient text-primary-foreground border-transparent shadow-soft"
                : "bg-card border-border/50 hover:border-primary/30 hover:bg-secondary/50"
            )}
          >
            <t.icon className={cn("w-5 h-5 mb-2", activeTab === t.id ? "text-primary-foreground" : "text-primary")} />
            <p className={cn("font-medium text-sm", activeTab === t.id ? "text-primary-foreground" : "text-foreground")}>{t.label}</p>
            <p className={cn("text-xs mt-0.5", activeTab === t.id ? "text-primary-foreground/70" : "text-muted-foreground")}>{t.desc}</p>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6 space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Memory Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Grandma's summer stories, Dad's wedding speech..."
            className="h-12 rounded-xl"
          />
        </div>

        {/* Upload area or text area */}
        {activeTab !== "text" ? (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {activeTab === "audio" ? "Audio Files" : activeTab === "document" ? "PDF Files" : "Photos / Videos"} *
            </label>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileRef.current?.click()}
              className={cn(
                "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200",
                dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-secondary/30"
              )}
            >
              <input
                ref={fileRef}
                type="file"
                multiple
                accept={activeTab === "audio" ? "audio/*" : activeTab === "document" ? "application/pdf" : "image/*,video/*"}
                className="hidden"
                onChange={handleFiles}
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium text-foreground mb-1">Drop files here, or click to browse</p>
              <p className="text-sm text-muted-foreground">{tabs.find((t) => t.id === activeTab)?.desc}</p>
            </div>

            {/* File list */}
            {files.length > 0 && (
              <div className="mt-4 space-y-2">
                {files.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {activeTab === "audio" ? <Mic className="w-4 h-4 text-primary" /> : activeTab === "document" ? <FileIcon className="w-4 h-4 text-primary" /> : <Image className="w-4 h-4 text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{f.name}</p>
                      <p className="text-xs text-muted-foreground">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-muted-foreground hover:text-destructive transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Write Your Memory *</label>
            <textarea
              value={textContent}
              onChange={(e) => setTextContent(e.target.value)}
              placeholder="Share your story, memory, letter, or life lesson here..."
              rows={10}
              className="w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{textContent.length} characters</p>
          </div>
        )}

        {/* Upload progress */}
        {status === "uploading" && (
          <div>
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground font-medium">Uploading...</span>
              <span className="text-muted-foreground">{progress}%</span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full accent-gradient rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="hero"
            size="lg"
            className="flex-1"
            onClick={handleSubmit}
            disabled={status === "uploading"}
          >
            {status === "uploading" ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Upload Memory
              </span>
            )}
          </Button>
          <Button variant="outline" size="lg" onClick={handleSaveDraft} disabled={status === "uploading"}>
            Save as Draft
          </Button>
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl bg-accent/30 border border-border/50 p-5">
        <h3 className="font-medium text-foreground mb-3 text-sm">Tips for best results</h3>
        <ul className="space-y-2">
          {[
            "Use clear, low-background-noise recordings for voice quality",
            "Minimum 5 minutes of audio recommended for voice cloning",
            "Add a descriptive title so stories are easy to find later",
            "PDFs need selectable text — scanned image-only PDFs can't be read yet",
            "Multiple shorter recordings work as well as one long one",
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-hope flex-shrink-0 mt-0.5" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
