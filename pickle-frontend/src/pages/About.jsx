import { Link } from "react-router-dom";
import { ArrowRight, Flame, Heart, Leaf } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function About() {
  return (
    <>
      <Navbar />
      <main className="bg-[#FAF5EB]">
        <section className="bg-[#F3E9D8] px-5 py-20 text-center md:py-28">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">A story of flavour</p>
          <h1 className="font-serif text-4xl leading-tight text-[#33251F] md:text-6xl">Rooted in Tradition.<span className="block italic text-[#8E2922]">Made for Today.</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-8 text-[#65564C] md:text-base">Inspired by the rich culinary heritage of Andhra Pradesh, Kumar Pickles celebrates bold, tangy and spicy flavours that bring people together around the table.</p>
        </section>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 md:grid-cols-2 lg:px-10 lg:py-24">
          <img src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85" alt="Traditional spices and ingredients" className="h-[380px] w-full object-cover md:h-[520px]" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">More than a condiment</p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-[#33251F]">A little taste of home, in every jar.</h2>
            <p className="mt-6 text-sm leading-8 text-[#65564C]">Some flavours are more than just food. They carry memories, traditions and the warmth of home. From timeless vegetarian favourites to flavour-packed non-vegetarian delicacies, every recipe tells a story worth sharing.</p>
            <div className="mt-8 grid grid-cols-3 gap-4 border-y border-[#E5D8C6] py-6">
              <div><Leaf className="mb-3 text-[#8E2922]" /><p className="text-xs font-semibold text-[#33251F]">Bold Flavours</p></div>
              <div><Heart className="mb-3 text-[#8E2922]" /><p className="text-xs font-semibold text-[#33251F]">Inspired by Home</p></div>
              <div><Flame className="mb-3 text-[#8E2922]" /><p className="text-xs font-semibold text-[#33251F]">Andhra Spice</p></div>
            </div>
            <Link to="/shop" className="mt-8 inline-flex items-center gap-3 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white hover:bg-[#702019]">Explore Our Pickles <ArrowRight size={17} /></Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default About;
