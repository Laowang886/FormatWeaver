import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import ConverterPanel from "@/components/converter/ConverterPanel";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-white">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <section className="pb-20 sm:pb-24">
          <ConverterPanel />
        </section>
      </main>

      <Footer />
    </div>
  );
}
