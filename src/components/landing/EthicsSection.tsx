import { Shield, Lock, Eye, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const principles = [
  {
    icon: Shield,
    title: "Consent First",
    description: "No voice is ever cloned without explicit, documented consent from the individual or their authorized representative.",
  },
  {
    icon: Lock,
    title: "Your Data, Your Control",
    description: "You decide who can access memories, when they can be used, and can delete everything at any time.",
  },
  {
    icon: Eye,
    title: "Transparent AI",
    description: "We clearly disclose what our AI can and cannot do. No false promises, no deceptive practices.",
  },
  {
    icon: Heart,
    title: "Designed for Healing",
    description: "Created in collaboration with grief counselors and ethicists to support, never exploit, the grieving process.",
  },
];

export function EthicsSection() {
  return (
    <section className="py-24 bg-accent/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <div>
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Our Commitment
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
                Ethics at the{" "}
                <span className="text-gradient-accent">Heart</span> of Everything
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                We believe technology should serve humanity with compassion. 
                Memory Keeper was built on a foundation of ethical principles 
                that guide every decision we make.
              </p>
              <Button variant="hero" asChild>
                <Link to="/consent">Read Our Ethics Framework</Link>
              </Button>
            </div>

            {/* Right Content - Principles Grid */}
            <div className="grid sm:grid-cols-2 gap-6">
              {principles.map((principle, index) => (
                <div
                  key={principle.title}
                  className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-500"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <principle.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {principle.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {principle.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
