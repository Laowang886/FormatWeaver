import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import ConverterPanel from "@/components/converter/ConverterPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.08),_transparent_35%),linear-gradient(180deg,#020617_0%,#0f172a_100%)] text-white">
      <Header />
      <HeroSection />

      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="rounded-3xl bg-slate-900/50 p-6">
          <ConverterPanel />
        </div>
      </main>

      <Footer />
    </div>
  );
}
