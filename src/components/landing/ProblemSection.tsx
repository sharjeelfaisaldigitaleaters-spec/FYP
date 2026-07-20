import { Heart, Clock, Users } from "lucide-react";

const problems = [
  {
    icon: Heart,
    title: "The Fear of Forgetting",
    description:
      "As time passes, the sound of a loved one's voice becomes harder to recall. The warmth in their tone, their unique expressions — these precious details slowly fade from memory.",
  },
  {
    icon: Clock,
    title: "Moments Lost to Time",
    description:
      "Stories that were never recorded, wisdom that was never shared, laughter that echoed only in the moment — time takes these irreplaceable treasures.",
  },
  {
    icon: Users,
    title: "Disconnected Generations",
    description:
      "Future generations may never hear their great-grandparents' voice or understand the full depth of their family's history and heritage.",
  },
];

export function ProblemSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Every Voice Carries a{" "}
            <span className="text-gradient-warm">Lifetime of Love</span>
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            We understand the deep connection between a voice and the person behind it. 
            The fear of losing these precious memories is universal.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="group p-8 rounded-3xl bg-card card-gradient border border-border/50 shadow-soft hover:shadow-card transition-all duration-500 hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-14 h-14 rounded-2xl bg-comfort flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <problem.icon className="w-7 h-7 text-comfort-foreground" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                {problem.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
