import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import ConverterPanel from "@/components/converter/ConverterPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#080b12] text-white">
      <Header />

      <main>
        <HeroSection />
        <section className="border-y border-white/10 bg-[#10141f]">
          <ConverterPanel />
        </section>
      </main>

      <Footer />
    </div>
  );
}
