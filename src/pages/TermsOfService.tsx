import { Layout } from "@/components/layout/Layout";

export default function TermsOfService() {
  return (
    <Layout>
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Legal
            </span>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Terms of Service</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-10">
            {[
              {
                title: "1. Acceptance of Terms",
                content: "By accessing or using Memory Keeper, you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any of these terms, you are prohibited from using this platform. These Terms constitute a legally binding agreement between you and Memory Keeper.",
              },
              {
                title: "2. Eligibility",
                content: "You must be at least 16 years old to use Memory Keeper. By using the platform, you represent and warrant that you meet this requirement. Users between 16 and 18 may use the platform only with parental or guardian consent.",
              },
              {
                title: "3. User Accounts",
                content: "You are responsible for maintaining the confidentiality of your account credentials. You agree to accept responsibility for all activities that occur under your account. You must notify us immediately of any unauthorized use of your account. We reserve the right to terminate accounts that violate these Terms.",
              },
              {
                title: "4. Consent and Ethical Use",
                content: "You agree to only upload voice recordings and likeness of individuals for whom you have obtained explicit, informed consent — or are the designated next-of-kin or legal representative. You agree not to use Memory Keeper to impersonate any person in a deceptive, harmful, or fraudulent manner. Violation of this clause may result in immediate account termination and legal action.",
              },
              {
                title: "5. Intellectual Property",
                content: "You retain ownership of all content you upload to Memory Keeper. By uploading content, you grant us a limited license to process, store, and use that content solely to provide our services. You represent that you have the right to upload all content and grant this license.",
              },
              {
                title: "6. Prohibited Activities",
                content: "You agree not to use Memory Keeper to: (a) violate any applicable law; (b) upload content without proper consent; (c) harass, threaten, or defame any person; (d) attempt to reverse-engineer our AI systems; (e) circumvent security measures; (f) use the platform for commercial purposes without authorization.",
              },
              {
                title: "7. Termination",
                content: "We may terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties. Upon termination, your right to use the platform immediately ceases.",
              },
              {
                title: "8. Limitation of Liability",
                content: "Memory Keeper shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or goodwill, arising from your use of or inability to use the platform. Our total liability shall not exceed the amount paid by you in the 12 months preceding the claim.",
              },
              {
                title: "9. Governing Law",
                content: "These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved in the courts of San Francisco County, California.",
              },
              {
                title: "10. Changes to Terms",
                content: "We reserve the right to modify these Terms at any time. We will provide notice of significant changes via email or prominent notice on the platform. Your continued use of Memory Keeper after changes constitutes acceptance of the new Terms.",
              },
              {
                title: "11. Contact",
                content: "For questions about these Terms, please contact us at: legal@memorykeeper.com",
              },
            ].map((section) => (
              <div key={section.title}>
                <h2 className="font-serif text-xl font-bold text-foreground mb-3">{section.title}</h2>
                <p className="text-muted-foreground leading-relaxed text-sm">{section.content}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
