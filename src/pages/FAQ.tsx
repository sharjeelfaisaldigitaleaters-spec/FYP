import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    category: "Getting Started",
    items: [
      { q: "What is Memory Keeper?", a: "Memory Keeper is an AI-powered platform that allows you to preserve the voices, stories, and wisdom of loved ones through ethical voice cloning and memory archiving. Families can then interact with these preserved memories in natural conversations." },
      { q: "Who is Memory Keeper designed for?", a: "Memory Keeper is designed for anyone who wants to preserve the memories of a loved one — whether they're aging, ill, or have passed away. It's also ideal for families who want to document their oral history for future generations." },
      { q: "How much audio do I need to get started?", a: "We recommend a minimum of 5 minutes of clear audio for basic voice preservation. For higher quality results, 30+ minutes of audio from various contexts produces the most natural-sounding voice model." },
    ],
  },
  {
    category: "Privacy & Ethics",
    items: [
      { q: "Is consent required to create a voice model?", a: "Absolutely. Memory Keeper operates under a strict ethical consent framework. For living individuals, explicit written consent is required. For loved ones who have passed, we require consent from their designated next-of-kin or estate representative." },
      { q: "Where is my data stored?", a: "All your memories, voice recordings, and personal data are stored in encrypted, secure cloud storage. We use AES-256 encryption at rest and TLS 1.3 in transit. Your data is never shared with third parties." },
      { q: "Can I delete my data at any time?", a: "Yes. You retain full ownership of all your data. You can delete individual memories, voice models, or your entire account at any time from the Settings page. Deletion is permanent and irreversible." },
      { q: "Is Memory Keeper HIPAA compliant?", a: "Yes, Memory Keeper is designed with HIPAA compliance principles in mind, particularly given its use in sensitive grief and eldercare contexts. We maintain strict data handling policies and access controls." },
    ],
  },
  {
    category: "AI & Technology",
    items: [
      { q: "How does the AI voice model work?", a: "Our AI analyzes voice recordings to learn the unique acoustic characteristics of a voice — tone, cadence, inflection, and emotional quality. It then synthesizes new speech that closely replicates these qualities using neural text-to-speech technology." },
      { q: "Can the AI say anything, or is it limited?", a: "The AI can engage in natural conversation, but its responses are grounded in the memories, stories, and information that have been uploaded. We include ethical guardrails to prevent misrepresentation or harmful content generation." },
      { q: "How long does AI processing take?", a: "Basic voice model creation typically takes 5–30 minutes depending on the length and quality of audio. You'll receive a notification when processing is complete." },
    ],
  },
  {
    category: "Family & Sharing",
    items: [
      { q: "Can multiple family members access the same memory collection?", a: "Yes. The Family Sharing feature allows you to invite family members with different access levels: Owner (full control), Editor (can add memories), and Viewer (read-only access to memories and conversations)." },
      { q: "Can family members in different countries use Memory Keeper?", a: "Yes. Memory Keeper is accessible worldwide. Family sharing works across borders, and our platform supports multiple languages for both the interface and AI conversations." },
    ],
  },
];

export default function FAQ() {
  const [openItem, setOpenItem] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = faqs.map((cat) => ({
    ...cat,
    items: cat.items.filter(
      (item) =>
        item.q.toLowerCase().includes(search.toLowerCase()) ||
        item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter((cat) => cat.items.length > 0);

  return (
    <Layout>
      {/* Hero */}
      <section className="py-24 hero-gradient">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block px-4 py-1 rounded-full bg-hope/10 text-hope text-sm font-medium mb-4">
            FAQ
          </span>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-5">
            Frequently Asked{" "}
            <span className="text-gradient-accent">Questions</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
            Everything you need to know about Memory Keeper.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full pl-12 pr-4 h-12 rounded-2xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring shadow-soft"
            />
          </div>
        </div>
      </section>

      {/* FAQ content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          {filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">No questions match your search.</p>
          ) : (
            <div className="space-y-12">
              {filtered.map((category) => (
                <div key={category.category}>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">{category.category}</h2>
                  <div className="space-y-3">
                    {category.items.map((item) => {
                      const key = `${category.category}-${item.q}`;
                      const isOpen = openItem === key;
                      return (
                        <div key={key} className="rounded-2xl bg-card border border-border/50 shadow-soft overflow-hidden">
                          <button
                            onClick={() => setOpenItem(isOpen ? null : key)}
                            className="w-full flex items-center justify-between gap-4 p-5 text-left"
                          >
                            <span className="font-medium text-foreground">{item.q}</span>
                            {isOpen
                              ? <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                              : <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                            }
                          </button>
                          {isOpen && (
                            <div className="px-5 pb-5">
                              <div className="h-px bg-border mb-4" />
                              <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-16 p-8 rounded-3xl bg-secondary/50 border border-border/50">
            <h3 className="font-serif text-xl font-bold text-foreground mb-2">Still have questions?</h3>
            <p className="text-muted-foreground text-sm mb-4">Our team is here to help.</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors text-sm"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
