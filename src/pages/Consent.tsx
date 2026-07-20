import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Shield,
  Lock,
  Eye,
  FileText,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const consentSections = [
  {
    id: "voice-cloning",
    title: "Voice Cloning Consent",
    description:
      "I authorize Memory Keeper to use the provided audio recordings to create an AI voice model of the specified individual.",
    details:
      "This consent applies to all audio files uploaded for voice synthesis. The voice model will be created using our ethical AI technology.",
    required: true,
  },
  {
    id: "data-storage",
    title: "Data Storage Agreement",
    description:
      "I consent to Memory Keeper securely storing my data, including audio, text, and images, in encrypted cloud storage.",
    details:
      "All data is encrypted at rest and in transit. You maintain ownership of your data and can request deletion at any time.",
    required: true,
  },
  {
    id: "family-sharing",
    title: "Family Sharing Permissions",
    description:
      "I authorize designated family members to access and interact with the preserved memories according to my permission settings.",
    details:
      "You control who can access memories. Each family member must accept the terms of use before accessing.",
    required: false,
  },
  {
    id: "ai-conversations",
    title: "AI Conversation Consent",
    description:
      "I understand that conversations are AI-generated and may not perfectly represent the original individual.",
    details:
      "Our AI strives for authenticity but is not a replacement for the actual person. Conversations are based on provided content.",
    required: true,
  },
  {
    id: "future-messages",
    title: "Future Messages Authorization",
    description:
      "I authorize the scheduling and delivery of pre-recorded or AI-generated messages to family members on specified dates.",
    details:
      "Messages can be scheduled for birthdays, anniversaries, and other meaningful occasions.",
    required: false,
  },
  {
    id: "research",
    title: "Anonymized Research Participation",
    description:
      "I optionally consent to my anonymized usage patterns being used to improve Memory Keeper's services.",
    details:
      "No personal content or identifiable information is used. Only aggregate patterns help us improve.",
    required: false,
  },
];

const principles = [
  {
    icon: Shield,
    title: "Consent Is Foundational",
    description:
      "No voice is ever cloned without explicit, documented consent from the individual or their legal representative.",
  },
  {
    icon: Lock,
    title: "Privacy by Design",
    description:
      "Your data is encrypted, never shared, and you can delete everything with a single click.",
  },
  {
    icon: Eye,
    title: "Transparency Always",
    description:
      "We clearly disclose our AI capabilities and limitations. No deceptive practices.",
  },
  {
    icon: FileText,
    title: "Your Data, Your Rights",
    description:
      "Download your data, transfer it, or delete it entirely. You're always in control.",
  },
];

const Consent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [consents, setConsents] = useState<Record<string, boolean>>({});
  const [signature, setSignature] = useState("");
  const [relation, setRelation] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetchApi("/consent/status");
        if (res.is_verified) {
          setAlreadyVerified(true);
        }
      } catch (err) {
        // user might not be logged in or other error
      } finally {
        setIsLoading(false);
      }
    };
    checkStatus();
  }, []);

  const toggleConsent = (id: string) => {
    setConsents((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const allRequiredAccepted = consentSections
    .filter((s) => s.required)
    .every((s) => consents[s.id]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Please log in to sign the consent form.");
      return;
    }
    if (!allRequiredAccepted) {
      toast.error("Please accept all required consents to continue.");
      return;
    }
    if (!signature.trim()) {
      toast.error("Please provide your digital signature.");
      return;
    }
    if (!relation.trim()) {
      toast.error("Please state your relationship to the deceased.");
      return;
    }

    setIsSubmitting(true);
    try {
      await fetchApi("/consent", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          signature_name: signature.trim(),
          relation_to_deceased: relation.trim(),
        }),
      });
      toast.success("Consent recorded successfully. Thank you for trusting us.");
      setAlreadyVerified(true);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error: any) {
      toast.error(error.message || "Failed to record consent. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Ethics & Consent
            </span>
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Your Trust Is{" "}
              <span className="text-gradient-accent">Sacred</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe in complete transparency. Understanding and consenting 
              to how your memories are preserved and protected is essential.
            </p>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {principles.map((principle) => (
              <div
                key={principle.title}
                className="p-6 rounded-2xl bg-card border border-border/50 shadow-soft"
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
      </section>

      {/* Consent Form */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/50 shadow-soft">
              {alreadyVerified ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-hope/10 flex items-center justify-center mx-auto mb-6">
                    <Check className="w-10 h-10 text-hope" />
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-foreground mb-4">
                    Consent Verified
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Your digital consent has been legally verified and recorded. You have full access to memory preservation features.
                  </p>
                  <Button variant="hero" size="lg" onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                  </Button>
                </div>
              ) : (
                <>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-2">
                    Consent Form
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Please review and accept the following consent items.
                  </p>

                  <div className="space-y-6">
                    {consentSections.map((section) => (
                      <div
                        key={section.id}
                        className="p-6 rounded-2xl bg-secondary/50 border border-border/30"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">
                                {section.title}
                              </h3>
                              {section.required && (
                                <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                                  Required
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {section.description}
                            </p>
                            <p className="text-xs text-muted-foreground/70">
                              {section.details}
                            </p>
                          </div>
                          <Switch
                            checked={consents[section.id] || false}
                            onCheckedChange={() => toggleConsent(section.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Signature */}
                  <div className="mt-8 p-6 rounded-2xl bg-accent/30 border border-border/30">
                    <h3 className="font-semibold text-foreground mb-3">
                      Digital Signature
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      By typing your full name and relationship below, you acknowledge that you have 
                      read and agree to the consents selected above, and you have the legal right to do so.
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Relationship to Deceased *</label>
                        <Input
                          placeholder="e.g. Son, Daughter, Spouse"
                          value={relation}
                          onChange={(e) => setRelation(e.target.value)}
                          className="h-12 rounded-xl bg-background"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Full Legal Name *</label>
                        <Input
                          type="text"
                          placeholder="Type your full legal name"
                          value={signature}
                          onChange={(e) => setSignature(e.target.value)}
                          className="h-12 rounded-xl bg-background"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mt-6 flex items-center gap-3">
                    {allRequiredAccepted ? (
                      <>
                        <Check className="w-5 h-5 text-hope" />
                        <span className="text-sm text-hope">
                          All required consents accepted
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-memory" />
                        <span className="text-sm text-memory">
                          Please accept all required consents
                        </span>
                      </>
                    )}
                  </div>

                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleSubmit}
                    disabled={!allRequiredAccepted || !signature.trim() || !relation.trim() || isSubmitting}
                    className="w-full mt-6"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Consent"
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Consent;
