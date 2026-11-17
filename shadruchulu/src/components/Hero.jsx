
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="relative overflow-hidden bg-[#F3E9D8]">
      <div className="mx-auto grid min-h-[600px] max-w-7xl items-center gap-10 px-5 py-16 md:grid-cols-2 lg:px-10 lg:py-20">

        <div className="z-10 max-w-xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">
            A Taste of Andhra
          </p>

          <h1 className="font-serif text-5xl font-medium leading-[1.15] text-[#33251F] md:text-6xl lg:text-7xl">
            Bringing Tradition
            <span className="mt-2 block italic text-[#8E2922]">
              to Your Table.
            </span>
          </h1>

          <p className="mt-7 max-w-md text-base leading-8 text-[#65564C]">
            Discover the authentic flavours of Andhra through our
            traditional pickle collection. Every jar brings a little
            taste of home to your table.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="inline-flex items-center gap-3 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]"
            >
              Explore Our Pickles
              <ArrowRight size={17} />
            </Link>

            <Link
              to="/about"
              className="border border-[#8E2922] px-7 py-4 text-sm font-semibold text-[#8E2922] transition hover:bg-[#8E2922] hover:text-white"
            >
              Our Story
            </Link>
          </div>

          <div className="mt-12 flex items-center gap-8 border-t border-[#D9C9B5] pt-6">
            <div>
              <p className="font-serif text-2xl text-[#8E2922]">10+</p>
              <p className="mt-1 text-xs text-[#65564C]">Flavours</p>
            </div>
            <div>
              <p className="font-serif text-2xl text-[#8E2922]">Andhra</p>
              <p className="mt-1 text-xs text-[#65564C]">Inspired</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-5 rounded-full bg-[#D5A34D]/20 blur-3xl" />

          <img
            src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85"
            alt="Traditional Indian food and spices"
            className="relative h-[400px] w-full rounded-tl-[140px] rounded-br-[140px] object-cover shadow-xl md:h-[520px]"
          />

          <div className="absolute -bottom-5 -left-3 bg-[#FAF5EB] px-6 py-4 shadow-lg md:-left-8">
            <p className="font-serif text-xl italic text-[#8E2922]">
              Six Tastes.
            </p>
            <p className="text-sm text-[#65564C]">
              Countless Memories.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
