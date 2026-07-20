import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Upload,
  Sparkles,
  MessageCircle,
  Users,
  Shield,
  Check,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: 1,
    icon: Upload,
    title: "Upload Audio & Memories",
    description:
      "Start by sharing voice recordings of your loved one. These can be phone calls, video clips, voice notes, or specially recorded messages. The more content you share, the richer the voice model becomes.",
    details: [
      "Upload any audio format (MP3, WAV, M4A, etc.)",
      "Minimum 5 minutes of clear audio recommended",
      "Background noise automatically reduced",
      "Option to add transcriptions for accuracy",
    ],
    color: "bg-primary",
  },
  {
    number: 2,
    icon: Sparkles,
    title: "AI Creates the Voice",
    description:
      "Our ethical AI carefully analyzes the audio to learn the unique qualities of the voice — the tone, cadence, inflections, and warmth that made it special. This process is conducted with the highest standards of privacy.",
    details: [
      "Advanced neural voice synthesis",
      "Captures emotional nuances",
      "No data shared with third parties",
      "Processing in secure, encrypted environment",
    ],
    color: "bg-memory",
  },
  {
    number: 3,
    icon: Shield,
    title: "Set Consent & Permissions",
    description:
      "Before any interaction, you'll establish clear consent boundaries. Decide who can access the voice, what topics are appropriate, and how the voice can be used. You maintain full control.",
    details: [
      "Granular permission settings",
      "Family member access levels",
      "Topic restrictions available",
      "Revoke access anytime",
    ],
    color: "bg-hope",
  },
  {
    number: 4,
    icon: MessageCircle,
    title: "Converse & Remember",
    description:
      "Begin meaningful conversations with the preserved voice. Ask questions, hear stories retold, and keep the connection alive. The AI draws from the memories and stories you've shared to create authentic interactions.",
    details: [
      "Natural conversation flow",
      "Voice or text interactions",
      "Stories from the memory library",
      "Appropriate for grief support",
    ],
    color: "bg-primary",
  },
  {
    number: 5,
    icon: Users,
    title: "Share with Family",
    description:
      "Invite family members to access the preserved memories. Create shared spaces where multiple family members can contribute stories, photos, and their own recordings to enrich the memory collection.",
    details: [
      "Invite via secure link",
      "Collaborative memory building",
      "Multiple contributor support",
      "Activity logs for transparency",
    ],
    color: "bg-memory",
  },
];

const HowItWorks = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              How It Works
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              A Thoughtful Process for{" "}
              <span className="text-gradient-accent">Precious Memories</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We've designed every step with care, ensuring the journey of 
              preservation is as meaningful as the memories themselves.
            </p>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-20 bottom-0 w-0.5 bg-border" />
                )}

                <div className="flex gap-8 pb-16">
                  {/* Step Number */}
                  <div className="flex-shrink-0">
                    <div
                      className={`w-14 h-14 rounded-2xl ${step.color} flex items-center justify-center shadow-card`}
                    >
                      <step.icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm font-medium text-muted-foreground">
                        Step {step.number}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                      {step.title}
                    </h2>
                    <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                      {step.description}
                    </p>
                    <div className="bg-secondary/50 rounded-2xl p-6">
                      <ul className="grid sm:grid-cols-2 gap-3">
                        {step.details.map((detail) => (
                          <li
                            key={detail}
                            className="flex items-center gap-3 text-sm"
                          >
                            <div className="w-5 h-5 rounded-full bg-hope/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-3 h-3 text-hope" />
                            </div>
                            <span className="text-foreground">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-accent/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start preserving the voices and memories of those you love today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard/upload">
                  Create Your First Memory
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/contact">Have Questions?</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
