import { Layout } from "@/components/layout/Layout";
import { Heart, Target, Users, Award } from "lucide-react";

const teamMembers = [
  {
    name: "Dr. Sarah Chen",
    role: "CEO & Founder",
    bio: "Former grief counselor with 15 years of experience, now leading the charge to ethically preserve memories.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Michael Torres",
    role: "CTO",
    bio: "AI researcher focused on ethical voice synthesis and natural language processing.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "Dr. Emily Watson",
    role: "Chief Ethics Officer",
    bio: "Bioethicist specializing in AI governance and digital consent frameworks.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=face",
  },
  {
    name: "James Park",
    role: "Head of Product",
    bio: "Designer with a passion for creating emotionally intelligent digital experiences.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
  },
];

const values = [
  {
    icon: Heart,
    title: "Compassion First",
    description: "Every decision we make starts with empathy for the families we serve.",
  },
  {
    icon: Target,
    title: "Ethical Innovation",
    description: "We push boundaries responsibly, never compromising on consent or privacy.",
  },
  {
    icon: Users,
    title: "Family-Centered",
    description: "We design for real families, with their diverse needs and healing journeys.",
  },
  {
    icon: Award,
    title: "Excellence",
    description: "We hold ourselves to the highest standards in technology and care.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              About Us
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Preserving Love Through{" "}
              <span className="text-gradient-accent">Technology</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Memory Keeper was born from a simple yet profound belief: 
              the voices and stories of those we love deserve to live on.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                We're on a mission to ensure that no voice is ever truly lost. Through 
                ethical AI technology, we help families preserve the unique essence of 
                their loved ones — their voice, their stories, their wisdom.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                But technology alone isn't enough. We're equally committed to doing this 
                with the utmost respect for consent, privacy, and the emotional journey 
                of grief and remembrance.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-elevated">
                <img
                  src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=800&fit=crop"
                  alt="Family sharing memories"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-2xl accent-gradient flex items-center justify-center shadow-card">
                
                <img
          src="r_bg.png"
          alt="Memory Keeper Logo"
          className="w-28 h-28 object-contain"
          />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Core Values
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              These principles guide every decision we make and every feature we build.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {values.map((value) => (
              <div
                key={value.title}
                className="text-center p-8 rounded-2xl bg-card border border-border/50 shadow-soft hover:shadow-card transition-all duration-500"
              >
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A diverse team of technologists, ethicists, and caregivers united by a 
              shared mission.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group rounded-2xl bg-card border border-border/50 overflow-hidden shadow-soft hover:shadow-card transition-all duration-500"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg text-foreground">
                    {member.name}
                  </h3>
                  <p className="text-primary text-sm mb-3">{member.role}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
