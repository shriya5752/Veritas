import Navbar from "../components/Navbar";
import HeroWipe from "../components/HeroWipe";
import Marquee from "../components/Marquee";
import HowSection from "../components/HowSection";
import TrainingSection from "../components/TrainingSection";
import { CTABanner, Footer } from "../components/CTABanner";

export default function LandingPage({ onOpenLab }) {
  return (
    <div>
      <Navbar onOpenLab={onOpenLab} />
      <HeroWipe onOpenLab={onOpenLab} />
      <Marquee />
      <HowSection />
      <TrainingSection />
      <CTABanner onOpenLab={onOpenLab} />
      <Footer />
    </div>
  );
}
