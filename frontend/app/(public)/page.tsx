import CTASection from '@/components/home/CTASection';
import FAQ from '@/components/home/FAQ';
import HeroSection from '@/components/home/HeroSection';
import Personas from '@/components/home/Personas';
import ProductPreview from '@/components/home/ProductPreview';
import StatsStrip from '@/components/home/StatsStrip';
import BeforeAfter from '@/components/home/BeforeAfter';
import HowItWorks from '@/components/home/HowItWorks';
import WhyUKNeedsPassports from '@/components/home/WhyUKNeedsPassports';
import PageWrapper from '@/components/home/PageWrapper';

export default function Home() {
  return (
    <PageWrapper>
      <HeroSection />
      <StatsStrip />
      <WhyUKNeedsPassports />
      <BeforeAfter />
      <HowItWorks />
      <Personas />
      <ProductPreview />
      <FAQ />
      <CTASection />
    </PageWrapper>
  );
}