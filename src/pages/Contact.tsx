import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send, Heart } from "lucide-react";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Placeholder API call
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
    } catch {
      // Expected to fail - no backend
    }

    setTimeout(() => {
      toast.success("Message sent! We'll get back to you soon.");
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Contact Us
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              We're Here to{" "}
              <span className="text-gradient-accent">Help</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Have questions? We'd love to hear from you. Our team is ready 
              to support you on your memory preservation journey.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                Get in Touch
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Whether you have questions about our service, need support, or 
                just want to share your story, we're here to listen.
              </p>

              <div className="space-y-6">
                <a
                  href="mailto:hello@memorykeeper.com"
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Email</h3>
                    <p className="text-muted-foreground text-sm">
                      hello@memorykeeper.com
                    </p>
                  </div>
                </a>

                <a
                  href="tel:+1234567890"
                  className="flex items-start gap-4 p-4 rounded-xl hover:bg-accent transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-memory/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-memory" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Phone</h3>
                    <p className="text-muted-foreground text-sm">
                      +1 (234) 567-890
                    </p>
                  </div>
                </a>

                <div className="flex items-start gap-4 p-4 rounded-xl">
                  <div className="w-11 h-11 rounded-xl bg-hope/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-hope" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Location</h3>
                    <p className="text-muted-foreground text-sm">
                      San Francisco, California
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 p-6 rounded-2xl bg-comfort/30 border border-comfort">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="w-5 h-5 text-comfort-foreground" />
                  <span className="font-medium text-foreground">
                    Need immediate support?
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  If you're going through a difficult time, please know that help 
                  is available. Our team includes grief support specialists who 
                  understand what you're experiencing.
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/50 shadow-soft">
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Send Us a Message
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Your Name
                      </label>
                      <Input
                        id="name"
                        placeholder="John Smith"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-foreground mb-2"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Subject
                    </label>
                    <Input
                      id="subject"
                      placeholder="How can we help?"
                      value={formData.subject}
                      onChange={(e) =>
                        setFormData({ ...formData, subject: e.target.value })
                      }
                      required
                      className="h-12 rounded-xl"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Your Message
                    </label>
                    <Textarea
                      id="message"
                      placeholder="Tell us what's on your mind..."
                      value={formData.message}
                      onChange={(e) =>
                        setFormData({ ...formData, message: e.target.value })
                      }
                      required
                      rows={6}
                      className="rounded-xl resize-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="hero"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      "Sending..."
                    ) : (
                      <>
                        Send Message
                        <Send className="w-4 h-4 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
