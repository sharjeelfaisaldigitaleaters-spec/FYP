import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters."),
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
    .regex(/[0-9]/, "Must contain at least one number."),
  confirmPassword: z.string(),
  consent: z.literal(true, { errorMap: () => ({ message: "You must accept the terms to continue." }) }),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
});
type FormData = z.infer<typeof schema>;

const getStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"];
const strengthColor = ["", "bg-destructive", "bg-memory", "bg-hope", "bg-hope"];

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const passwordValue = watch("password") || "";
  const strength = getStrength(passwordValue);

  const onSubmit = async (data: FormData) => {
    try {
      await signup(data.name, data.email, data.password);
      toast.success("Account created! Welcome to Memory Keeper.");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Signup failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex hero-gradient">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-memory/10 via-accent/10 to-primary/10 pointer-events-none" />
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center shadow-soft">
              <img src="r_bg.png" alt="Memory Keeper" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Memory Keeper</span>
          </Link>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="font-serif text-4xl font-bold text-foreground leading-tight">
            Start your journey of<br />
            <span className="text-gradient-accent">remembrance today.</span>
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Join thousands of families preserving what matters most — the voices, stories, and wisdom of the people they love.
          </p>
          <div className="space-y-4">
            {[
              "Upload voice recordings, photos, and written memories",
              "Generate an AI voice model with ethical consent",
              "Share securely with family members worldwide",
              "Schedule future messages for special occasions",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-hope/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3 h-3 text-hope" />
                </div>
                <span className="text-sm text-muted-foreground">{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-xs text-muted-foreground">
          © 2026 Memory Keeper. All rights reserved.
        </div>
      </div>

      {/* Right — Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl accent-gradient flex items-center justify-center">
              <img src="r_bg.png" alt="Memory Keeper" className="w-8 h-8 object-contain" />
            </div>
            <span className="font-serif text-xl font-semibold text-foreground">Memory Keeper</span>
          </div>

          <div className="mb-8">
            <h2 className="font-serif text-3xl font-bold text-foreground mb-2">Create your account</h2>
            <p className="text-muted-foreground">Free to start — preserve your first memory today.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  {...register("name")}
                  placeholder="John Smith"
                  className={cn("pl-12 h-12 rounded-xl", errors.name && "border-destructive")}
                  autoComplete="name"
                />
              </div>
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="john@example.com"
                  className={cn("pl-12 h-12 rounded-xl", errors.email && "border-destructive")}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  className={cn("pl-12 pr-12 h-12 rounded-xl", errors.password && "border-destructive")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {/* Strength bar */}
              {passwordValue && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-all duration-300",
                          i <= strength ? strengthColor[strength] : "bg-border"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password strength: <span className="font-medium text-foreground">{strengthLabel[strength]}</span>
                  </p>
                </div>
              )}
              {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <Input
                  {...register("confirmPassword")}
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  className={cn("pl-12 pr-12 h-12 rounded-xl", errors.confirmPassword && "border-destructive")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-destructive text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {/* Consent */}
            <div className="flex items-start gap-3">
              <input
                {...register("consent")}
                type="checkbox"
                id="consent"
                className="w-4 h-4 rounded border-border mt-0.5 cursor-pointer"
              />
              <label htmlFor="consent" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                I agree to the{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>,{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>, and{" "}
                <Link to="/consent" className="text-primary hover:underline">Ethics & Consent Framework</Link>.
              </label>
            </div>
            {errors.consent && <p className="text-destructive text-xs -mt-3">{errors.consent.message}</p>}

            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating account...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Create Free Account
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
