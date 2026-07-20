import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Upload, MessageCircle, BookOpen,
  Users, Settings, Menu, X, LogOut, ChevronRight, Shield, Sparkles, UserCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const sidebarLinks = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/personalities", label: "My Personalities", icon: UserCircle },
  { href: "/dashboard/create-personality", label: "Create Personality", icon: Sparkles },
  { href: "/dashboard/upload", label: "Upload Memory", icon: Upload },
  { href: "/dashboard/conversation", label: "Conversation", icon: MessageCircle },
  { href: "/dashboard/library", label: "Story Library", icon: BookOpen },
  { href: "/dashboard/family", label: "Family Sharing", icon: Users },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];


const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("You've been signed out.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border transform transition-transform duration-300 lg:transform-none flex flex-col shadow-soft",
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-9 h-9 rounded-xl accent-gradient flex items-center justify-center shadow-soft">
              <img src="/r_bg.png" alt="Memory Keeper" className="w-7 h-7 object-contain" />
            </div>
            <span className="font-serif text-lg font-semibold text-foreground">Memory Keeper</span>
          </Link>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-border">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
            <div className="w-9 h-9 rounded-xl accent-gradient flex items-center justify-center flex-shrink-0">
              <span className="text-primary-foreground font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarLinks.map((link) => {
            const isActive = link.exact
              ? location.pathname === link.href
              : location.pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                  isActive
                    ? "accent-gradient text-primary-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/70"
                )}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
                {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all duration-200 border border-dashed border-border mt-4"
            >
              <Shield className="w-4 h-4" />
              Admin Portal
            </Link>
          )}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-lg border-b border-border h-16 flex items-center justify-between px-4 md:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="hidden lg:block">
            <p className="text-sm text-muted-foreground">
              Welcome back, <span className="font-semibold text-foreground">{user?.name?.split(" ")[0]}</span>
            </p>
          </div>
          <div className="flex items-center gap-3 ml-auto lg:ml-0">
            <div className="w-8 h-8 rounded-xl accent-gradient flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() ?? "U"}
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
};

export default Dashboard;
