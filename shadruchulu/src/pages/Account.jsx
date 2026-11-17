import { Link } from "react-router-dom";
import { ArrowRight, ClipboardList, LayoutDashboard, UserRound } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function Account() {
  return (
    <>
      <Navbar />
      <main className="grid min-h-[55vh] place-items-center bg-[#FAF5EB] px-5 py-16 text-center">
        <div className="max-w-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#F3E9D8] text-[#8E2922]"><UserRound size={28} /></div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">Welcome to Shadruchulu</p>
          <h1 className="mt-3 font-serif text-4xl text-[#33251F]">Your Account</h1>
          <p className="mt-4 text-sm leading-7 text-[#65564C]">Customer sign-in and account management will be added in a later phase. For now, you can view demo orders saved in this browser.</p>
          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/orders" className="inline-flex items-center justify-center gap-3 bg-[#8E2922] px-6 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]"><ClipboardList size={17} /> View My Orders <ArrowRight size={16} /></Link>
            <Link to="/admin" className="inline-flex items-center justify-center gap-3 border border-[#D9C9B5] bg-white px-6 py-4 text-sm font-semibold text-[#8E2922] transition hover:border-[#8E2922]"><LayoutDashboard size={17} /> Store Dashboard</Link>
          </div>
          <p className="mt-5 text-xs leading-5 text-[#827365]">Demo preview only. The store dashboard is not password-protected yet, and orders are stored locally on this device.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default Account;
