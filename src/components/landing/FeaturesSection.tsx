import { 
  MessageSquare, 
  BookOpen, 
  Clock, 
  Users, 
  Shield, 
  Heart 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const features = [
  {
    icon: MessageSquare,
    title: "Interactive Conversations",
    description: "Engage in natural, meaningful conversations with AI-preserved voices.",
    color: "bg-primary/10",
    iconColor: "text-primary",
  },
  {
    icon: BookOpen,
    title: "Story Library",
    description: "Curate and organize memories, stories, and life lessons in one place.",
    color: "bg-memory/10",
    iconColor: "text-memory",
  },
  {
    icon: Clock,
    title: "Future Messages",
    description: "Schedule messages for special occasions — birthdays, graduations, weddings.",
    color: "bg-hope/10",
    iconColor: "text-hope",
  },
  {
    icon: Users,
    title: "Family Sharing Portal",
    description: "Share memories securely with family members across the world.",
    color: "bg-accent",
    iconColor: "text-accent-foreground",
  },
  {
    icon: Shield,
    title: "Ethical Consent Framework",
    description: "Complete control over consent, usage rights, and data management.",
    color: "bg-comfort",
    iconColor: "text-comfort-foreground",
  },
  {
    icon: Heart,
    title: "Grief Support Integration",
    description: "Resources and tools designed with mental health professionals.",
    color: "bg-secondary",
    iconColor: "text-secondary-foreground",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="inline-block px-4 py-1 rounded-full bg-hope/10 text-hope text-sm font-medium mb-4">
            Thoughtfully Designed
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Features Built with{" "}
            <span className="text-gradient-accent">Heart & Purpose</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Every feature is designed to honor memories while respecting 
            the emotional journey of preservation.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 75}ms` }}
            >
              <div
                className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
              </div>
              <h3 className="font-semibold text-lg text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link to="/features">View All Features</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
