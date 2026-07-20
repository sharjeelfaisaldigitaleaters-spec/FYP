import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Upload, MessageCircle, BookOpen, Users, Heart, Sparkles, ArrowRight, Mic, Image, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getStats, getActivity, getStories, getMemories, Memory, Story } from "@/data/mockStore";
import { fetchApi } from "@/lib/api";
import { cn } from "@/lib/utils";

const activityIcons = {
  upload: Upload,
  conversation: MessageCircle,
  family: Users,
  story: BookOpen,
};
const activityColors = {
  upload: "bg-primary/10 text-primary",
  conversation: "bg-memory/10 text-memory",
  family: "bg-hope/10 text-hope",
  story: "bg-accent text-accent-foreground",
};

export default function Overview() {
  const { user } = useAuth();
  const userId = user?.id ?? "user-1";
  const [stats, setStats] = useState(getStats(userId));
  const [activity] = useState(getActivity(userId));
  const [featuredStory, setFeaturedStory] = useState<Story | null>(null);
  const [memories, setMemories] = useState<Memory[]>([]);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const statsData = await fetchApi("/library/stats");
        setStats(statsData);

        const memoriesData = await fetchApi("/library/memories");
        setMemories(memoriesData);

        const storiesData = await fetchApi("/library/stories");
        if (storiesData.length > 0) {
          const favorite = storiesData.find((s: Story) => s.isFavorite);
          setFeaturedStory(favorite || storiesData[0]);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      }
    }
    loadDashboard();
  }, []);

  const statCards = [
    { label: "Memories Uploaded", value: stats.memoriesUploaded, icon: Upload, color: "text-primary", bg: "bg-primary/10" },
    { label: "Stories Saved", value: stats.storiesSaved, icon: BookOpen, color: "text-memory", bg: "bg-memory/10" },
    { label: "Conversations", value: stats.conversations, icon: MessageCircle, color: "text-hope", bg: "bg-hope/10" },
    { label: "Family Members", value: stats.familyMembers, icon: Users, color: "text-accent-foreground", bg: "bg-accent" },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="rounded-3xl accent-gradient p-8 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm font-medium text-primary-foreground/80">Welcome back</span>
            </div>
            <h1 className="font-serif text-3xl font-bold mb-2">{user?.name ?? "Friend"}</h1>
            <p className="text-primary-foreground/75 text-sm max-w-sm">
              Continue your journey of preserving precious memories.
            </p>
          </div>
          <Button
            size="lg"
            className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-card flex-shrink-0"
            asChild
          >
            <Link to="/dashboard/upload">
              <Upload className="w-4 h-4 mr-2" />
              Upload Memory
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-0.5">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", s.bg)}>
              <s.icon className={cn("w-5 h-5", s.color)} />
            </div>
            <p className="font-serif text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Featured story */}
        {featuredStory && (
          <div className="lg:col-span-2 rounded-2xl bg-card border border-border/50 shadow-soft overflow-hidden">
            <div className="warm-gradient p-6">
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-primary-foreground/80" />
                <span className="text-sm font-medium text-primary-foreground/80">Featured Memory</span>
              </div>
              <h2 className="font-serif text-2xl font-bold text-primary-foreground mb-2">
                {featuredStory.title}
              </h2>
              <p className="text-primary-foreground/75 text-sm leading-relaxed line-clamp-3">
                {featuredStory.excerpt}
              </p>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-xs font-medium">
                  {featuredStory.category}
                </span>
                <span>{featuredStory.date}</span>
                <span>{featuredStory.duration} read</span>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to="/dashboard/library">
                  Read Story <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        )}

        {/* Recent activity */}
        <div className="rounded-2xl bg-card border border-border/50 shadow-soft">
          <div className="p-5 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-3">
            {activity.slice(0, 4).map((item) => {
              const Icon = activityIcons[item.type];
              const colorClass = activityColors[item.type];
              return (
                <div key={item.id} className="flex items-start gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors">
                  <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0", colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground leading-tight">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</p>
                    <p className="text-xs text-muted-foreground/60 mt-1">{item.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent memories */}
      {memories.length > 0 && (
        <div className="rounded-2xl bg-card border border-border/50 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-border flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your Memories</h2>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard/upload">Add More</Link>
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {memories.slice(0, 3).map((m) => {
              const Icon = m.type === "audio" ? Mic : m.type === "image" ? Image : FileText;
              const color = m.type === "audio" ? "text-primary bg-primary/10" : m.type === "image" ? "text-memory bg-memory/10" : "text-hope bg-hope/10";
              return (
                <div key={m.id} className="p-5 hover:bg-secondary/30 transition-colors">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <p className="font-medium text-foreground text-sm mb-1">{m.title}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className={cn("px-2 py-0.5 rounded-full capitalize", m.status === "processed" ? "bg-hope/10 text-hope" : "bg-memory/10 text-memory")}>
                      {m.status}
                    </span>
                    <span>{m.size}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { href: "/dashboard/conversation", label: "Start a Conversation", icon: MessageCircle, desc: "Talk with a preserved voice", color: "bg-primary/10 text-primary" },
          { href: "/dashboard/library", label: "Browse Stories", icon: BookOpen, desc: "Read captured memories", color: "bg-memory/10 text-memory" },
          { href: "/dashboard/family", label: "Invite Family", icon: Users, desc: "Share memories together", color: "bg-hope/10 text-hope" },
        ].map((q) => (
          <Link
            key={q.href}
            to={q.href}
            className="p-5 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card hover:-translate-y-0.5 transition-all duration-300 group"
          >
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-3", q.color)}>
              <q.icon className="w-5 h-5" />
            </div>
            <p className="font-medium text-foreground text-sm">{q.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{q.desc}</p>
            <ArrowRight className="w-4 h-4 text-muted-foreground mt-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        ))}
      </div>
    </div>
  );
}
