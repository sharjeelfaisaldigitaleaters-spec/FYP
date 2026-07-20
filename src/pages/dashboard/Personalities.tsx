import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Sparkles, MessageCircle, Upload, Pencil, Trash2, Mic, MicOff, Loader2, Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi, API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Persona {
  id: string;
  name: string;
  relation: string;
  voice_id?: string | null;
  memoriesCount?: number;
}

export default function Personalities() {
  const navigate = useNavigate();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadPersonas = async () => {
    try {
      const data = await fetchApi("/conversation/personas");
      setPersonas(data || []);
    } catch (err) {
      console.error("Failed to load personalities:", err);
      toast.error("Failed to load your personalities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPersonas();
  }, []);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const token = localStorage.getItem("mk_access_token");
      const res = await fetch(`${API_BASE_URL}/conversation/personas/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to delete personality.");
      setPersonas(prev => prev.filter(p => p.id !== id));
      toast.success("Personality deleted.");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete personality.");
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground mb-1">My Personalities</h1>
          <p className="text-muted-foreground text-sm">Every digital personality you've built, each with its own memories and voice.</p>
        </div>
        <Button onClick={() => navigate("/dashboard/create-personality")} className="rounded-2xl gap-2">
          <Sparkles className="w-4 h-4" /> Create New Personality
        </Button>
      </div>

      {personas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 text-center p-16 rounded-3xl bg-card border border-border/50">
          <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-primary/60" />
          </div>
          <div>
            <p className="font-semibold text-foreground">No personalities yet</p>
            <p className="text-muted-foreground text-sm mt-1">Build your first digital personality to start a conversation.</p>
          </div>
          <Button onClick={() => navigate("/dashboard/create-personality")} className="rounded-2xl gap-2">
            <Sparkles className="w-4 h-4" /> Create Personality
          </Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {personas.map(p => (
            <div key={p.id} className="bg-card border border-border/50 rounded-2xl p-5 flex flex-col gap-4 hover:shadow-card transition-all duration-300">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-violet-500/20 border border-primary/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-black text-primary">{p.name?.[0]?.toUpperCase() ?? "?"}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{p.name || "AI Replica"}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.relation || "Loved One"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn(
                  "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium",
                  p.voice_id ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
                )}>
                  {p.voice_id ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
                  {p.voice_id ? "Voice Ready" : "No Voice"}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground">
                  {p.memoriesCount ?? 0} {p.memoriesCount === 1 ? "memory" : "memories"}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-2 border-t border-border/30">
                <Button
                  size="sm"
                  className="rounded-xl gap-1.5 flex-1"
                  onClick={() => navigate(`/dashboard/conversation?persona=${p.id}`)}
                >
                  <MessageCircle className="w-3.5 h-3.5" /> Talk
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5"
                  onClick={() => navigate(`/dashboard/upload?persona=${p.id}`)}
                  title="Add memories"
                >
                  <Upload className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5"
                  onClick={() => navigate(`/dashboard/create-personality/${p.id}`)}
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl gap-1.5 text-destructive hover:text-destructive"
                  onClick={() => setConfirmDeleteId(p.id)}
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border/50 rounded-3xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground mb-1">Delete this personality?</h2>
              <p className="text-muted-foreground text-sm">
                This permanently deletes its conversation history, memories, and cloned voice. This can't be undone.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="destructive"
                className="rounded-2xl gap-2"
                disabled={deletingId === confirmDeleteId}
                onClick={() => handleDelete(confirmDeleteId)}
              >
                {deletingId === confirmDeleteId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Permanently
              </Button>
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
