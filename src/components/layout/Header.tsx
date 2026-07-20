import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LogOut, Settings, LayoutDashboard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/features", label: "Features" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    toast.success("Signed out successfully.");
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <img src="r_bg.png" alt="Memory Keeper Logo" className="w-8 h-8 object-contain" />
            <span className="font-serif text-xl font-semibold text-foreground">Memory Keeper</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300",
                  location.pathname === link.href
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border/50 hover:bg-accent transition-all duration-200"
                >
                  <div className="w-7 h-7 rounded-lg accent-gradient flex items-center justify-center">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-lg object-cover" />
                    ) : (
                      <span className="text-primary-foreground text-xs font-bold">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium text-foreground max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={cn("w-4 h-4 text-muted-foreground transition-transform", userMenuOpen && "rotate-180")} />
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-2xl border border-border/50 shadow-elevated z-20 overflow-hidden">
                      <div className="px-4 py-3 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                      <div className="p-2">
                        <Link
                          to="/dashboard"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                        <Link
                          to="/dashboard/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                          >
                            <Shield className="w-4 h-4" />
                            Admin Portal
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors mt-1 border-t border-border pt-3"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button variant="hero" size="sm" asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden absolute top-full left-0 right-0 bg-background border-b border-border overflow-hidden transition-all duration-300",
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300",
                location.pathname === link.href
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-border mt-2">
            {isAuthenticated ? (
              <>
                <Button variant="outline" asChild>
                  <Link to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</Link>
                </Button>
                <Button variant="hero" onClick={() => { handleLogout(); setIsOpen(false); }}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login" onClick={() => setIsOpen(false)}>Sign In</Link>
                </Button>
                <Button variant="hero" asChild>
                  <Link to="/signup" onClick={() => setIsOpen(false)}>Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
