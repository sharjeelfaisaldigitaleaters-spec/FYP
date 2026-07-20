import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Clock, Sparkles, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  return (
    <Layout>
      <section className="py-32 hero-gradient min-h-[80vh] flex items-center">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-memory/10 text-memory text-sm font-medium mb-8">
              <Clock className="w-4 h-4" />
              Coming Soon
            </div>
            <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
              Pricing is on<br />
              <span className="text-gradient-accent">its way.</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 max-w-lg mx-auto">
              We're crafting thoughtful pricing plans that make Memory Keeper accessible to every family. 
              Join the waitlist to be first to know when we launch.
            </p>

            {/* Waitlist form */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mb-12">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 h-12 px-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button variant="hero" size="lg" className="flex-shrink-0" onClick={() => alert("You're on the waitlist!")}>
                <Bell className="w-4 h-4 mr-2" />
                Notify Me
              </Button>
            </div>

            {/* Teasers */}
            <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
              {[
                { tier: "Free", desc: "Start preserving with limited uploads and conversations.", highlight: false },
                { tier: "Family", desc: "Unlimited uploads, full AI voice, and family sharing.", highlight: true },
                { tier: "Lifetime", desc: "One-time payment for unlimited access forever.", highlight: false },
              ].map((p) => (
                <div key={p.tier} className={`p-6 rounded-2xl border text-center ${p.highlight ? "accent-gradient text-primary-foreground border-transparent shadow-elevated" : "bg-card border-border/50 shadow-soft"}`}>
                  {p.highlight && (
                    <div className="flex items-center justify-center gap-1.5 mb-3">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-xs font-medium">Most Popular</span>
                    </div>
                  )}
                  <h3 className={`font-serif text-xl font-bold mb-2 ${p.highlight ? "text-primary-foreground" : "text-foreground"}`}>{p.tier}</h3>
                  <p className={`text-sm ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{p.desc}</p>
                  <div className={`mt-4 font-bold text-2xl ${p.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                    TBA
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <Link to="/" className="text-primary hover:underline text-sm">← Back to home</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
