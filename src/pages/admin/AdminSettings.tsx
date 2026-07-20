import { useState } from "react";
import { Globe, Mail, Bell, Shield, Wrench, Save, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    siteName: "Memory Keeper",
    supportEmail: "support@memorykeeper.com",
    maintenanceMode: false,
    newSignups: true,
    emailNotifications: true,
    aiProcessing: true,
    familySharing: true,
    maxUploadMB: 100,
    maxFamilyMembers: 10,
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key as string] }));
  };

  const handleSave = () => {
    toast.success("Platform settings saved.");
  };

  const ToggleSwitch = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative w-11 h-6 rounded-full transition-all duration-300 ${active ? "bg-violet-600" : "bg-slate-700"}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${active ? "left-6" : "left-1"}`} />
    </button>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-serif text-3xl font-bold text-white mb-1">Platform Settings</h1>
        <p className="text-slate-400">Configure global platform behavior and limits.</p>
      </div>

      {/* General */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <Globe className="w-4 h-4 text-blue-400" />
          <h2 className="text-white font-semibold">General</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Site Name</label>
            <input
              value={settings.siteName}
              onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Support Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full pl-11 pr-4 h-11 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feature Flags */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <Wrench className="w-4 h-4 text-violet-400" />
          <h2 className="text-white font-semibold">Feature Flags</h2>
        </div>
        <div className="p-6 space-y-5">
          {[
            { key: "maintenanceMode" as const, label: "Maintenance Mode", desc: "Disable public access to the site", danger: true },
            { key: "newSignups" as const, label: "New Signups", desc: "Allow new user registrations" },
            { key: "emailNotifications" as const, label: "Email Notifications", desc: "Send system emails to users" },
            { key: "aiProcessing" as const, label: "AI Processing", desc: "Enable voice model generation" },
            { key: "familySharing" as const, label: "Family Sharing", desc: "Allow users to invite family members" },
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className={`font-medium text-sm ${item.danger ? "text-red-400" : "text-slate-200"}`}>{item.label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <ToggleSwitch active={!!settings[item.key]} onToggle={() => toggle(item.key)} />
            </div>
          ))}
        </div>
      </div>

      {/* Limits */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <h2 className="text-white font-semibold">Upload & Access Limits</h2>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Max Upload Size (MB)</label>
            <input
              type="number"
              value={settings.maxUploadMB}
              onChange={(e) => setSettings({ ...settings, maxUploadMB: +e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Max Family Members per Account</label>
            <input
              type="number"
              value={settings.maxFamilyMembers}
              onChange={(e) => setSettings({ ...settings, maxFamilyMembers: +e.target.value })}
              className="w-full h-11 px-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition-colors shadow-lg shadow-violet-900/30"
        >
          <Save className="w-4 h-4" />
          Save Settings
        </button>
      </div>
    </div>
  );
}
