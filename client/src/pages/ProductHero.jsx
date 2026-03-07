
import SlideSection from "../components/Slide/SlideSection";
import AdBanner from "./AdBanner";

export default function ProductHero() {
  return (
    <section className="w-full min-h-[85vh] grid lg:grid-cols-2">

      {/* Left Side */}
      <div className="flex items-center">
        <AdBanner />
      </div>

      {/* Right Side */}
      <div className="flex items-center">
        <SlideSection />
      </div>

    </section>
  );
}