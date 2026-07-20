import { Upload, Sparkles, MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const steps = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Audio & Memories",
    description:
      "Share voice recordings, photos, and written memories. The more you share, the richer the preservation becomes.",
    color: "bg-primary",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "AI Creates the Voice",
    description:
      "Our ethical AI carefully learns the unique qualities of the voice — the tone, cadence, and warmth that made it special.",
    color: "bg-memory",
  },
  {
    number: "03",
    icon: MessageCircle,
    title: "Converse & Remember",
    description:
      "Have meaningful conversations, hear stories retold, and keep the connection alive across generations.",
    color: "bg-hope",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Simple & Thoughtful Process
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            How Memory Keeper Works
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We've designed every step with care, ensuring the process is as 
            meaningful as the memories you're preserving.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-memory to-hope -translate-y-1/2 z-0" />

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative group"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="bg-card rounded-3xl p-8 border border-border/50 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-2">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-5xl font-serif font-bold text-border">
                      {step.number}
                    </span>
                    <div
                      className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                    >
                      <step.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="flex justify-center py-4 lg:hidden">
                    <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center mt-12">
          <Button variant="hero" size="lg" asChild>
            <Link to="/how-it-works">
              Learn More About the Process
              <ArrowRight className="w-5 h-5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
