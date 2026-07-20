import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Heart } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-memory/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-3xl accent-gradient p-12 md:p-16 text-center shadow-elevated">
            <div className="w-16 h-16 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
              <img
          src="cropped_circle.png"
          alt="Memory Keeper Logo"
          className="w-8 h-8 object-contain"
          />
            </div>

            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-primary-foreground mb-6">
              Begin Preserving What Matters Most
            </h2>

            <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto mb-10 leading-relaxed">
              Start your journey today. Create a lasting legacy that keeps 
              the voices and memories of your loved ones alive for generations.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                size="xl"
                className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 shadow-card"
                asChild
              >
                <Link to="/dashboard/upload">
                  Create Your First Memory
                  <ArrowRight className="w-5 h-5 ml-1" />
                </Link>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                asChild
              >
                <Link to="/contact">Talk to Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
