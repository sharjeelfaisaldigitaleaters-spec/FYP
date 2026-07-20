import { Layout } from "@/components/layout/Layout";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <section className="py-16 hero-gradient">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Legal
            </span>
            <h1 className="font-serif text-4xl font-bold text-foreground mb-3">Privacy Policy</h1>
            <p className="text-muted-foreground">Last updated: January 1, 2026</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="prose prose-slate max-w-none space-y-10">
            {[
              {
                title: "1. Introduction",
                content: "Memory Keeper ('we', 'our', or 'us') is committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform. Please read this policy carefully. If you disagree with its terms, please discontinue use of our platform.",
              },
              {
                title: "2. Information We Collect",
                content: "We collect information you voluntarily provide when registering an account, including your name, email address, and payment information. When you use the platform, we may collect audio recordings, photographs, videos, and written content you upload. We also collect usage data, device information, and cookies necessary for platform functionality.",
              },
              {
                title: "3. How We Use Your Information",
                content: "We use your information to provide and improve our services, including generating AI voice models, creating story libraries, and enabling family sharing features. We do not sell your personal data to third parties. We may use anonymized, aggregated data to improve our AI models and platform experience.",
              },
              {
                title: "4. Data Storage and Security",
                content: "All personal data and uploaded memories are encrypted at rest using AES-256 encryption and in transit using TLS 1.3. We store data in secure, SOC 2 Type II certified data centers. Access to your data is strictly controlled and logged. Despite our safeguards, no internet transmission is 100% secure.",
              },
              {
                title: "5. Voice and Biometric Data",
                content: "Voice recordings and AI-generated voice models constitute biometric data under applicable law. We handle this data with the highest level of protection. Biometric data is never shared with third parties without your explicit consent. You may request deletion of all biometric data at any time.",
              },
              {
                title: "6. Data Retention",
                content: "We retain your account data for as long as your account is active. When you delete your account, we permanently delete all associated data within 30 days, except where retention is required by law. Draft and archived content follows the same deletion schedule.",
              },
              {
                title: "7. Your Rights",
                content: "Depending on your jurisdiction, you may have the right to access, correct, or delete your personal data; to object to or restrict certain processing; to data portability; and to withdraw consent at any time. To exercise these rights, contact us at privacy@memorykeeper.com.",
              },
              {
                title: "8. Cookies",
                content: "We use essential cookies for authentication and platform functionality. We do not use tracking or advertising cookies. You can control cookie settings through your browser, though disabling essential cookies may affect platform functionality.",
              },
              {
                title: "9. Children's Privacy",
                content: "Memory Keeper is not intended for children under 16 years of age. We do not knowingly collect personal information from children under 16. If we learn we have collected such information, we will delete it promptly.",
              },
              {
                title: "10. Contact Us",
                content: "If you have questions about this Privacy Policy or our data practices, please contact our Privacy Team at: privacy@memorykeeper.com or Memory Keeper Privacy Team, 123 Memory Lane, San Francisco, CA 94105.",
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
