import { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, HardDrive, BarChart3, Settings,
  Shield, Menu, X, ChevronRight, ArrowLeft, Bell, LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const adminLinks = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/memories", label: "Memories", icon: HardDrive },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out of admin portal.");
    navigate("/admin-login");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 transform transition-transform duration-300 lg:transform-none flex flex-col",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">Admin Portal</p>
              <p className="text-xs text-slate-500">Memory Keeper</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminLinks.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.href
              : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                )}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/40">
            <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
              <span className="text-violet-300 text-sm font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-200 truncate">{user?.name}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800 h-16 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to site
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-500" />
            </button>
            <div className="w-8 h-8 rounded-lg bg-violet-600/30 border border-violet-500/30 flex items-center justify-center">
              <span className="text-violet-300 text-sm font-bold">
                {user?.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
