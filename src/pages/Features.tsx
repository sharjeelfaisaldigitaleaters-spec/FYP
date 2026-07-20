import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  BookOpen,
  Clock,
  Users,
  Shield,
  Heart,
  Mic,
  Image,
  Video,
  Lock,
  Globe,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const mainFeatures = [
  {
    icon: MessageSquare,
    title: "Interactive Conversations",
    description:
      "Engage in natural, meaningful conversations with AI-preserved voices. Ask questions, hear stories, and feel the connection that transcends time.",
    highlights: [
      "Natural language understanding",
      "Context-aware responses",
      "Voice-based or text conversations",
    ],
    color: "bg-primary",
  },
  {
    icon: BookOpen,
    title: "Story Library",
    description:
      "Curate and organize memories, stories, and life lessons in one beautiful, searchable library. Tag, categorize, and rediscover precious moments.",
    highlights: [
      "Organized by themes & timeline",
      "Full-text search",
      "Rich media support",
    ],
    color: "bg-memory",
  },
  {
    icon: Clock,
    title: "Future Messages",
    description:
      "Schedule messages for special occasions — birthdays, graduations, weddings. Let loved ones receive words of wisdom and love when they need it most.",
    highlights: [
      "Date-specific scheduling",
      "Recurring occasions",
      "Milestone triggers",
    ],
    color: "bg-hope",
  },
  {
    icon: Users,
    title: "Family Sharing Portal",
    description:
      "Share memories securely with family members across the world. Control who sees what, and create shared spaces for collective remembrance.",
    highlights: [
      "Granular permissions",
      "Invite via email",
      "Collaborative spaces",
    ],
    color: "bg-accent-foreground",
  },
  {
    icon: Shield,
    title: "Ethical Consent Framework",
    description:
      "Complete control over consent, usage rights, and data management. Our consent process is designed with ethicists and legal experts.",
    highlights: [
      "Clear consent documentation",
      "Easy revocation",
      "Transparent usage logs",
    ],
    color: "bg-primary",
  },
  {
    icon: Heart,
    title: "Grief Support Integration",
    description:
      "Resources and tools designed with mental health professionals. Access support when you need it, as part of your remembrance journey.",
    highlights: [
      "Professional resources",
      "Community support",
      "Wellness check-ins",
    ],
    color: "bg-comfort-foreground",
  },
];

const additionalFeatures = [
  { icon: Mic, title: "Voice Recording", description: "High-quality audio capture" },
  { icon: Image, title: "Photo Memories", description: "Visual story preservation" },
  { icon: Video, title: "Video Integration", description: "Rich multimedia support" },
  { icon: Lock, title: "End-to-End Encryption", description: "Military-grade security" },
  { icon: Globe, title: "Multi-Language", description: "Support for 50+ languages" },
  { icon: Sparkles, title: "AI Enhancement", description: "Intelligent audio restoration" },
];

const Features = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Features
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Everything You Need to{" "}
              <span className="text-gradient-accent">Preserve Memories</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Thoughtfully designed features that honor the past while 
              embracing the possibilities of technology.
            </p>
          </div>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="space-y-24 max-w-6xl mx-auto">
            {mainFeatures.map((feature, index) => (
              <div
                key={feature.title}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div
                    className={`w-14 h-14 rounded-2xl ${feature.color} flex items-center justify-center mb-6`}
                  >
                    <feature.icon className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                    {feature.title}
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    {feature.description}
                  </p>
                  <ul className="space-y-3">
                    {feature.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-hope" />
                        <span className="text-muted-foreground">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="aspect-video rounded-3xl bg-gradient-to-br from-accent via-secondary to-comfort shadow-elevated flex items-center justify-center">
                    <feature.icon className="w-24 h-24 text-primary/20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              And So Much More
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every detail has been considered to create the most complete 
              memory preservation platform.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {additionalFeatures.map((feature) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
              Ready to Start Preserving?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Begin your journey today and create lasting memories.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/dashboard/upload">
                Create Your First Memory
                <ArrowRight className="w-5 h-5 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Features;
