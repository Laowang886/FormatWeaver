import RegisterForm from "@/components/RegisterForm";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#060913] text-white">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:px-6 sm:py-14">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
}
