import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { EthicsSection } from "@/components/landing/EthicsSection";
import { CTASection } from "@/components/landing/CTASection";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <FeaturesSection />
      <EthicsSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
