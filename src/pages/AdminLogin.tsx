import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Mail, Lock, Shield, ArrowRight, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});
type FormData = z.infer<typeof schema>;

export default function AdminLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const { adminLogin } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    try {
      await adminLogin(data.email, data.password);
      toast.success("Welcome to the Admin Portal.");
      navigate("/admin", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Authentication failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden p-6">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-violet-900/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <Shield className="w-8 h-8 text-violet-400" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400 text-sm">Restricted access — authorized personnel only</p>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-amber-300/80 text-xs leading-relaxed">
            This is a restricted admin area. Unauthorized access attempts are logged and may result in legal action.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800 shadow-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  {...register("email")}
                  type="email"
                  placeholder="admin@memorykeeper.com"
                  autoComplete="email"
                  className={cn(
                    "w-full pl-12 pr-4 h-12 rounded-xl bg-slate-800/60 border text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all",
                    errors.email ? "border-red-500/50" : "border-slate-700"
                  )}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 pointer-events-none" />
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className={cn(
                    "w-full pl-12 pr-12 h-12 rounded-xl bg-slate-800/60 border text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all",
                    errors.password ? "border-red-500/50" : "border-slate-700"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-violet-900/40"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Access Admin Portal
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-6 p-3 rounded-xl bg-violet-900/20 border border-violet-800/30">
            <p className="text-xs text-slate-400">
              Demo: <code className="text-violet-400">admin@memorykeeper.com</code> / any password
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Not an admin?{" "}
          <Link to="/login" className="text-slate-400 hover:text-slate-200 transition-colors">
            Go to user login
          </Link>
        </p>
      </div>
    </div>
  );
}
