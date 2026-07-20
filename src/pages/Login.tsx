import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
  remember: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex hero-gradient">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/10 to-memory/10 pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-soft">
              <img src="r_bg.png" alt="Memory Keeper" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Memory Keeper</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-4 leading-tight">
              Preserve the voices<br />
              <span className="text-gradient-accent">that matter most.</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Keep the stories, wisdom, and warmth of your loved ones alive through ethical AI technology.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Memories Preserved", value: "50,000+" },
              { label: "Families Connected", value: "12,000+" },
              { label: "Stories Captured", value: "200,000+" },
              { label: "Countries", value: "48" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm">
                <p className="font-serif text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-card/60 border border-border/30 backdrop-blur-sm">
            <div className="w-2 h-2 rounded-full bg-hope animate-pulse" />
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">HIPAA Compliant</span> · End-to-End Encrypted · Ethically Designed
            </p>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center">
              <img src="r_bg.png" alt="Memory Keeper" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Memory Keeper</span>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to continue preserving your memories.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  className={cn("pl-12 h-12 rounded-xl", errors.email && "border-destructive focus-visible:ring-destructive")}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-foreground">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className={cn("pl-12 pr-12 h-12 rounded-xl", errors.password && "border-destructive")}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Remember */}
            <div className="flex items-center gap-3">
              <input
                {...register("remember")}
                type="checkbox"
                id="remember"
                className="w-4 h-4 rounded border-border text-primary cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">or continue with</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* Demo credentials hint */}
          <div className="p-4 rounded-xl bg-accent/40 border border-border/50 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Demo Credentials</span>
            </div>
            <p className="text-xs text-muted-foreground">Email: <code className="text-primary">john@example.com</code></p>
            <p className="text-xs text-muted-foreground">Password: <code className="text-primary">any text</code></p>
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary font-medium hover:underline">
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
