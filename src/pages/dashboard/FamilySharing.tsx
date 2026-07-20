import { useState, useEffect } from "react";
import { Users, Mail, Plus, Trash2, RefreshCw, Crown, Edit, Copy, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FamilyMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  role: "owner" | "editor" | "viewer";
  status: "active" | "pending";
  joinedAt?: string;
}

const roleColors: Record<FamilyMember["role"], string> = {
  owner: "bg-memory/10 text-memory border-memory/30",
  editor: "bg-hope/10 text-hope border-hope/30",
  viewer: "bg-accent text-accent-foreground border-border/50",
};

const roleIcons: Record<FamilyMember["role"], typeof Crown> = {
  owner: Crown,
  editor: Edit,
  viewer: Users,
};

function ConfirmDialog({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-elevated p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-destructive" />
        </div>
        <h3 className="font-semibold text-foreground text-center mb-2">Remove {name}?</h3>
        <p className="text-muted-foreground text-sm text-center mb-6">
          They will lose access to all shared memories immediately.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
          <Button className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground" onClick={onConfirm}>
            Remove
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function FamilySharing() {
  const { user } = useAuth();
  const userId = user?.id ?? "user-1";

  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [confirmRemove, setConfirmRemove] = useState<FamilyMember | null>(null);
  const [copied, setCopied] = useState(false);
  const [cooldowns, setCooldowns] = useState<Record<string, boolean>>({});

  const inviteLink = `https://memorykeeper.com/invite/${userId.replace("user-", "")}-${Date.now().toString(36)}`;

  const loadMembers = async () => {
    try {
      const data = await fetchApi("/family/members");
      setMembers(data.map((item: any) => ({
        ...item,
        userId: item.user_id,
        joinedAt: item.created_at ? new Date(item.created_at).toLocaleDateString() : undefined,
      })));
    } catch (error) {
      toast.error("Failed to load family members.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !/\S+@\S+\.\S+/.test(inviteEmail)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (members.some((m) => m.email === inviteEmail.trim())) {
      toast.error("This person is already a member or has a pending invitation.");
      return;
    }

    try {
      const newMember = await fetchApi("/family/invite", {
        method: "POST",
        body: JSON.stringify({
          name: inviteEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
          email: inviteEmail.trim(),
          role: "viewer",
        })
      });
      setMembers([...members, {
        ...newMember,
        userId: newMember.user_id,
        joinedAt: newMember.created_at ? new Date(newMember.created_at).toLocaleDateString() : undefined,
      }]);
      setInviteEmail("");
      toast.success(`Invitation sent to ${inviteEmail}.`);
    } catch (error) {
      toast.error("Failed to send invitation.");
    }
  };

  const handleRemove = (member: FamilyMember) => {
    setConfirmRemove(member);
  };

  const confirmRemoveMember = async () => {
    if (!confirmRemove) return;
    try {
      await fetchApi(`/family/members/${confirmRemove.id}`, { method: "DELETE" });
      setMembers(members.filter(m => m.id !== confirmRemove.id));
      toast.success(`${confirmRemove.name} has been removed.`);
    } catch (error) {
      toast.error("Failed to remove family member.");
    } finally {
      setConfirmRemove(null);
    }
  };

  const handleResend = (id: string, email: string) => {
    if (cooldowns[id]) return;
    setCooldowns((prev) => ({ ...prev, [id]: true }));
    toast.success(`Invitation resent to ${email}.`);
    setTimeout(() => setCooldowns((prev) => ({ ...prev, [id]: false })), 30000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      toast.success("Invite link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const activeCount = members.filter((m) => m.status === "active").length;
  const pendingCount = members.filter((m) => m.status === "pending").length;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Family Sharing</h1>
        <p className="text-muted-foreground">Invite family members to access and contribute to shared memories.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Members", value: isLoading ? "-" : members.length, color: "text-foreground" },
          { label: "Active", value: isLoading ? "-" : activeCount, color: "text-hope" },
          { label: "Pending", value: isLoading ? "-" : pendingCount, color: "text-memory" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-2xl bg-card border border-border/50 shadow-soft text-center">
            <p className={cn("font-serif text-2xl font-bold", s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invite form */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6">
        <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-primary" />
          Invite a Family Member
        </h2>
        <p className="text-sm text-muted-foreground mb-5">Send them a private invitation by email.</p>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="family@example.com"
              className="pl-11 h-12 rounded-xl"
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
            />
          </div>
          <Button variant="hero" size="lg" onClick={handleInvite} className="flex-shrink-0">
            <Plus className="w-4 h-4 mr-1" />
            Send Invite
          </Button>
        </div>

        {/* Or copy link */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Or share this invite link directly:</p>
          <div className="flex gap-2">
            <input
              value={inviteLink}
              readOnly
              className="flex-1 h-10 px-3 rounded-xl bg-secondary border border-border text-sm text-muted-foreground"
            />
            <button
              onClick={handleCopyLink}
              className={cn(
                "flex items-center gap-2 px-4 h-10 rounded-xl text-sm font-medium transition-all",
                copied ? "bg-hope/10 text-hope border border-hope/30" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"
              )}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div className="rounded-2xl bg-card border border-border/50 shadow-soft overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">{isLoading ? "..." : members.length} Members</h2>
        </div>

        <div className="divide-y divide-border">
          {members.map((m) => {
            const RoleIcon = roleIcons[m.role];
            return (
              <div key={m.id} className="flex items-center gap-4 px-6 py-4 hover:bg-secondary/30 transition-colors">
                {/* Avatar */}
                {m.avatar ? (
                  <img src={m.avatar} alt={m.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-foreground font-bold text-sm">{m.name.charAt(0)}</span>
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground text-sm">{m.name}</p>
                    {m.status === "pending" && (
                      <span className="px-2 py-0.5 rounded-full bg-memory/10 text-memory text-xs font-medium border border-memory/20">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.email}</p>
                  {m.joinedAt && <p className="text-xs text-muted-foreground/60 mt-0.5">Joined {m.joinedAt}</p>}
                </div>

                {/* Role badge */}
                <span className={cn("hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-xs font-medium capitalize", roleColors[m.role])}>
                  <RoleIcon className="w-3 h-3" />
                  {m.role}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {m.status === "pending" && (
                    <button
                      onClick={() => handleResend(m.id, m.email)}
                      disabled={cooldowns[m.id]}
                      title="Resend invitation"
                      className={cn(
                        "p-2 rounded-xl transition-colors text-muted-foreground",
                        cooldowns[m.id]
                          ? "opacity-40 cursor-not-allowed"
                          : "hover:text-primary hover:bg-primary/10"
                      )}
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                  {m.role !== "owner" && (
                    <button
                      onClick={() => handleRemove(m)}
                      title="Remove member"
                      className="p-2 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm dialog */}
      {confirmRemove && (
        <ConfirmDialog
          name={confirmRemove.name}
          onConfirm={confirmRemoveMember}
          onCancel={() => setConfirmRemove(null)}
        />
      )}
    </div>
  );
}
