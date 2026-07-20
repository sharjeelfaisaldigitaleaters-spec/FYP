import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const schema = z.object({
  email: z.string().email("Please enter a valid email address."),
});
type FormData = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const email = watch("email");

  const onSubmit = async (_data: FormData) => {
    await new Promise((r) => setTimeout(r, 1000));
    setSent(true);
    toast.success("Reset link sent! Check your inbox.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center hero-gradient p-6">
      <div className="w-full max-w-md">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-card rounded-3xl border border-border/50 shadow-elevated p-8 md:p-10">
          <div className="flex items-center gap-3 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl accent-gradient flex items-center justify-center">
                <img src="r_bg.png" alt="Memory Keeper" className="w-7 h-7 object-contain" />
              </div>
              <span className="font-serif text-lg font-semibold text-foreground">Memory Keeper</span>
            </Link>
          </div>

          {!sent ? (
            <>
              <div className="mb-8">
                <h1 className="font-serif text-2xl font-bold text-foreground mb-2">
                  Reset your password
                </h1>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Enter the email address associated with your account and we'll send you a link to reset your password.
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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

                <Button type="submit" variant="hero" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Reset Link
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-hope/10 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-hope" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-foreground mb-3">Check your inbox</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                We've sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
                <br />
                The link expires in 15 minutes.
              </p>
              <Button variant="outline" size="lg" className="w-full" onClick={() => setSent(false)}>
                Try a different email
              </Button>
            </div>
          )}

          <p className="text-center text-sm text-muted-foreground mt-6">
            Remember your password?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
