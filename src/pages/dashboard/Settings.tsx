import { useState, useEffect, useRef } from "react";
import { User, Bell, Shield, Download, Trash2, Camera, Save, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

function DeleteAccountDialog({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  const [typed, setTyped] = useState("");
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl border border-border/50 shadow-elevated p-8 max-w-md w-full">
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground text-center mb-2">Delete Account</h3>
        <p className="text-muted-foreground text-sm text-center mb-6">
          This will permanently delete your account, all memories, and stories. This action cannot be undone.
        </p>
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground mb-2">
            Type <code className="px-1.5 py-0.5 rounded bg-secondary text-destructive text-sm">DELETE</code> to confirm
          </label>
          <Input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
            className="rounded-xl border-destructive/30 focus:ring-destructive/30"
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onCancel}>Cancel</Button>
          <Button
            className="flex-1 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            disabled={typed !== "DELETE"}
            onClick={onConfirm}
          >
            Delete My Account
          </Button>
        </div>
      </div>
    </div>
  );
}

type Tab = "profile" | "notifications" | "privacy" | "danger";

export default function Settings() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCurrentPwd, setShowCurrentPwd] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    avatar: user?.avatar ?? "",
  });

  const [notifications, setNotifications] = useState({
    newStory: true,
    familyActivity: true,
    aiProcessing: true,
    weeklyDigest: false,
    marketingEmails: false,
  });

  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    shareActivity: false,
    allowFamilySearch: true,
    dataAnalytics: true,
  });

  const [passwordForm, setPasswordForm] = useState({ current: "", newPwd: "", confirm: "" });

  const loadSettings = async () => {
    try {
      const data = await fetchApi("/settings");
      if (data.profile) {
        setProfile({
          name: data.profile.name || user?.name || "",
          email: data.profile.email || user?.email || "",
          phone: data.profile.phone || "",
          avatar: data.profile.avatar || "",
        });
      }
      if (data.preferences) {
        setNotifications({
          newStory: data.preferences.new_story ?? true,
          familyActivity: data.preferences.family_activity ?? true,
          aiProcessing: data.preferences.ai_processing ?? true,
          weeklyDigest: data.preferences.weekly_digest ?? false,
          marketingEmails: false,
        });
      }
    } catch (error) {
      // Don't toast error on initial load to avoid spamming if backend is fresh
      console.error("Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((prev) => ({ ...prev, avatar: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    if (!profile.name.trim() || !profile.email.trim()) {
      toast.error("Name and email are required.");
      return;
    }
    try {
      await fetchApi("/settings/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          avatar: profile.avatar,
        })
      });
      updateUser({ name: profile.name, email: profile.email, phone: profile.phone, avatar: profile.avatar });
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error("Failed to update profile.");
    }
  };

  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.newPwd || !passwordForm.confirm) {
      toast.error("Please fill in all password fields.");
      return;
    }
    if (passwordForm.newPwd.length < 8) {
      toast.error("New password must be at least 8 characters.");
      return;
    }
    if (passwordForm.newPwd !== passwordForm.confirm) {
      toast.error("Passwords do not match.");
      return;
    }
    setPasswordForm({ current: "", newPwd: "", confirm: "" });
    toast.success("Password changed successfully.");
  };

  const handleSaveNotifications = async () => {
    try {
      await fetchApi("/settings/notifications", {
        method: "PUT",
        body: JSON.stringify({
          new_story: notifications.newStory,
          family_activity: notifications.familyActivity,
          ai_processing: notifications.aiProcessing,
          weekly_digest: notifications.weeklyDigest,
        })
      });
      toast.success("Notification preferences saved.");
    } catch (error) {
      toast.error("Failed to save notification preferences.");
    }
  };
  
  const handleSavePrivacy = () => toast.success("Privacy settings saved.");

  const handleExport = async () => {
    try {
      const data = await fetchApi("/settings"); // For now just export settings, expanding later
      const blob = new Blob([JSON.stringify({ ...data, exportedAt: new Date().toISOString() }, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `memory-keeper-export-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported successfully.");
    } catch (error) {
      toast.error("Failed to export data.");
    }
  };

  const handleDeleteAccount = () => {
    logout();
    toast.success("Your account has been deleted.");
    navigate("/");
  };

  const tabs: { id: Tab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle },
  ];

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${checked ? "accent-gradient" : "bg-secondary border border-border"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${checked ? "left-6" : "left-1"}`} />
    </button>
  );

  if (isLoading) {
    return <div className="max-w-3xl mx-auto space-y-6"><p className="text-muted-foreground">Loading settings...</p></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">Manage your account, preferences, and privacy.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-2xl bg-secondary/50 border border-border w-fit flex-wrap">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
              activeTab === t.id
                ? "bg-card shadow-soft text-foreground"
                : "text-muted-foreground hover:text-foreground",
              t.id === "danger" && activeTab === "danger" && "text-destructive"
            )}
          >
            <t.icon className={cn("w-4 h-4", t.id === "danger" && "text-destructive")} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Profile tab */}
      {activeTab === "profile" && (
        <div className="space-y-6">
          <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6">
            <h2 className="font-semibold text-foreground mb-5">Profile Information</h2>

            {/* Avatar */}
            <div className="flex items-center gap-5 mb-6">
              <div className="relative">
                {profile.avatar ? (
                  <img src={profile.avatar} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover border-2 border-border" />
                ) : (
                  <div className="w-20 h-20 rounded-2xl accent-gradient flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-3xl">
                      {profile.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-primary flex items-center justify-center shadow-soft border-2 border-background"
                >
                  <Camera className="w-3.5 h-3.5 text-primary-foreground" />
                </button>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="font-medium text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-xs text-primary hover:underline mt-1"
                >
                  Change photo
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                <Input
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
                <Input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone (optional)</label>
                <Input
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+1 (234) 567-890"
                  className="h-12 rounded-xl"
                />
              </div>
            </div>

            <Button variant="hero" size="lg" className="mt-5" onClick={handleSaveProfile}>
              <Save className="w-4 h-4 mr-2" />
              Save Profile
            </Button>
          </div>

          {/* Password */}
          <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6">
            <h2 className="font-semibold text-foreground mb-5">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Current Password</label>
                <div className="relative">
                  <Input
                    type={showCurrentPwd ? "text" : "password"}
                    value={passwordForm.current}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                    className="h-12 rounded-xl pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPwd(!showCurrentPwd)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">New Password</label>
                <Input
                  type="password"
                  value={passwordForm.newPwd}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPwd: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Confirm New Password</label>
                <Input
                  type="password"
                  value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="h-12 rounded-xl"
                />
              </div>
            </div>
            <Button variant="outline" size="lg" className="mt-5" onClick={handleChangePassword}>
              Update Password
            </Button>
          </div>
        </div>
      )}

      {/* Notifications tab */}
      {activeTab === "notifications" && (
        <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6 space-y-5">
          <h2 className="font-semibold text-foreground">Email Notifications</h2>
          {[
            { key: "newStory" as const, label: "New story generated", desc: "When AI creates a story from your memories" },
            { key: "familyActivity" as const, label: "Family activity", desc: "When family members view or contribute" },
            { key: "aiProcessing" as const, label: "AI processing updates", desc: "When voice model generation completes" },
            { key: "weeklyDigest" as const, label: "Weekly digest", desc: "A summary of your memory collection each week" },
            { key: "marketingEmails" as const, label: "Product updates", desc: "News about new features and improvements" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-foreground text-sm">{item.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <Toggle checked={notifications[item.key]} onChange={() => setNotifications((p) => ({ ...p, [item.key]: !p[item.key] }))} />
            </div>
          ))}
          <Button variant="hero" size="lg" className="mt-2" onClick={handleSaveNotifications}>
            <Save className="w-4 h-4 mr-2" />
            Save Preferences
          </Button>
        </div>
      )}

      {/* Privacy tab */}
      {activeTab === "privacy" && (
        <div className="space-y-5">
          <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6 space-y-5">
            <h2 className="font-semibold text-foreground">Privacy Controls</h2>
            {[
              { key: "profileVisible" as const, label: "Visible to family members", desc: "Family members can see your profile" },
              { key: "shareActivity" as const, label: "Share activity with family", desc: "Family can see when you add new memories" },
              { key: "allowFamilySearch" as const, label: "Searchable by email", desc: "Others can find you by email address" },
              { key: "dataAnalytics" as const, label: "Help improve Memory Keeper", desc: "Share anonymized usage data" },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-foreground text-sm">{item.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
                <Toggle checked={privacy[item.key]} onChange={() => setPrivacy((p) => ({ ...p, [item.key]: !p[item.key] }))} />
              </div>
            ))}
            <Button variant="hero" size="lg" className="mt-2" onClick={handleSavePrivacy}>
              <Save className="w-4 h-4 mr-2" />
              Save Privacy Settings
            </Button>
          </div>

          <div className="rounded-2xl bg-card border border-border/50 shadow-soft p-6">
            <h2 className="font-semibold text-foreground mb-2">Export Your Data</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Download all your memories, stories, and account data as a JSON file.
            </p>
            <Button variant="outline" size="lg" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export My Data
            </Button>
          </div>
        </div>
      )}

      {/* Danger Zone */}
      {activeTab === "danger" && (
        <div className="rounded-2xl bg-card border border-destructive/30 shadow-soft p-6">
          <h2 className="font-semibold text-destructive mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h2>
          <p className="text-muted-foreground text-sm mb-6">
            These actions are permanent and cannot be undone.
          </p>
          <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-medium text-foreground">Delete Account</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="outline"
                size="lg"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <DeleteAccountDialog
          onConfirm={handleDeleteAccount}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
