import { useState, useEffect } from "react";
import { Search, Heart, Play, BookOpen, Filter, X, Volume2, Clock, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Story {
  id: string;
  userId: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  duration: string;
  isFavorite: boolean;
  hasAudio?: boolean;
}

const CATEGORIES = ["All", "Love Stories", "Childhood", "Family Traditions", "Life Changes", "Wisdom"];

function StoryModal({ story, onClose }: { story: Story; onClose: () => void }) {
  const speakStory = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(`${story.title}. ${story.excerpt}`);
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
    toast.success("Reading story aloud...");
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-card rounded-3xl border border-border/50 shadow-elevated max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="warm-gradient p-8 rounded-t-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-medium mb-3">
                {story.category}
              </span>
              <h2 className="font-serif text-2xl font-bold text-primary-foreground">{story.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-primary-foreground/70 text-sm">
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{story.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{story.duration} read</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-8">
          <p className="text-foreground leading-relaxed text-base mb-6 font-serif">{story.excerpt}</p>
          <p className="text-muted-foreground leading-relaxed text-sm mb-8">
            This memory was captured and preserved in the Memory Keeper vault. It represents a precious moment that has been safeguarded for future generations to cherish and learn from.
          </p>
          {story.hasAudio && (
            <Button onClick={speakStory} variant="outline" className="w-full gap-2 rounded-xl h-12">
              <Volume2 className="w-4 h-4" />
              Listen to Story Aloud
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function StoryLibrary() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  const loadStories = async () => {
    try {
      const data = await fetchApi("/library/stories");
      setStories(data.map((item: any) => ({
        id: item.id,
        userId: item.user_id,
        title: item.title,
        excerpt: item.content || item.excerpt, // Handle mapping from backend schema
        date: item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown",
        category: item.category || "All",
        duration: "5 min", // Mocked duration for now
        isFavorite: item.is_favorite || false,
        hasAudio: item.has_audio || false,
      })));
    } catch (error) {
      toast.error("Failed to load stories.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, []);

  const handleFavorite = async (id: string) => {
    // Optimistic update
    setStories((prev) => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
    try {
      await fetchApi(`/library/stories/favorite/${id}`, { method: "POST" });
    } catch (error) {
      toast.error("Failed to update favorite status.");
      // Revert optimistic update
      setStories((prev) => prev.map(s => s.id === id ? { ...s, isFavorite: !s.isFavorite } : s));
    }
  };

  const handleListen = (story: Story) => {
    if (!story.hasAudio) { toast.info("No audio available for this story."); return; }
    if (!window.speechSynthesis) { toast.error("Text-to-speech not supported."); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(story.excerpt);
    utt.rate = 0.85;
    window.speechSynthesis.speak(utt);
    toast.success(`Listening to "${story.title}"...`);
  };

  const filtered = stories.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || s.category === category;
    const matchFav = !showFavoritesOnly || s.isFavorite;
    return matchSearch && matchCat && matchFav;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Story Library</h1>
        <p className="text-muted-foreground">Browse and revisit your preserved memories and stories.</p>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stories..."
            className="w-full pl-11 pr-4 h-11 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          />
        </div>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all",
            showFavoritesOnly
              ? "bg-memory/10 text-memory border-memory/30"
              : "bg-card border-border text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("w-4 h-4", showFavoritesOnly && "fill-memory")} />
          Favorites
        </button>
      </div>

      {/* Category pills */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
              category === cat
                ? "accent-gradient text-primary-foreground shadow-soft"
                : "bg-card border border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-sm text-muted-foreground">
        {isLoading ? "Loading stories..." : `${filtered.length} ${filtered.length === 1 ? "story" : "stories"}`}
        {!isLoading && category !== "All" && ` in "${category}"`}
        {!isLoading && showFavoritesOnly && " (favorites only)"}
      </p>

      {/* Stories grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((story) => (
          <div
            key={story.id}
            className="group rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Card header */}
            <div className={cn(
              "p-5 pb-4",
              story.isFavorite ? "warm-gradient" : "hero-gradient"
            )}>
              <div className="flex items-start justify-between gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-full bg-primary-foreground/20 text-primary-foreground text-xs font-medium">
                  {story.category}
                </span>
                <button
                  onClick={() => handleFavorite(story.id)}
                  className="p-1.5 rounded-lg bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
                >
                  <Heart className={cn("w-4 h-4", story.isFavorite ? "fill-primary-foreground text-primary-foreground" : "text-primary-foreground/60")} />
                </button>
              </div>
              <h3 className="font-serif text-lg font-bold text-primary-foreground leading-tight">{story.title}</h3>
            </div>

            {/* Card body */}
            <div className="p-5 flex-1 flex flex-col">
              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 flex-1 mb-4">
                {story.excerpt}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{story.date}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{story.duration}</span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 rounded-xl text-xs"
                  onClick={() => setSelectedStory(story)}
                >
                  <BookOpen className="w-3.5 h-3.5 mr-1" />
                  Read
                </Button>
                {story.hasAudio && (
                  <Button
                    size="sm"
                    className="flex-1 rounded-xl text-xs accent-gradient text-primary-foreground border-0"
                    onClick={() => handleListen(story)}
                  >
                    <Volume2 className="w-3.5 h-3.5 mr-1" />
                    Listen
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-card border border-border/50">
          <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-40" />
          <p className="text-foreground font-medium mb-1">No stories found</p>
          <p className="text-muted-foreground text-sm">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Story detail modal */}
      {selectedStory && <StoryModal story={selectedStory} onClose={() => setSelectedStory(null)} />}
    </div>
  );
}
