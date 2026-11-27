
import { ArrowUpRight, Leaf, Heart, Flame } from "lucide-react";
import { Link } from "react-router-dom";

const BrandStory = () => {
  return (
    <section className="overflow-hidden bg-[#FAF5EB] px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2 lg:gap-20">

        {/* Image Section */}
        <div className="relative">
          <div className="absolute -left-5 -top-5 h-40 w-40 border border-[#D5A34D]/50" />

          <img
            src="https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=1200&q=85"
            alt="Traditional Indian spices and ingredients"
            className="relative z-10 h-[420px] w-full object-cover md:h-[550px]"
          />

          <div className="absolute -bottom-7 -right-3 z-20 bg-[#8E2922] px-7 py-6 text-white shadow-xl md:-right-7">
            <p className="font-serif text-3xl italic">Made with</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F0C77B]">
              Love & Tradition
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="pt-5 lg:pt-0">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">
            A Story of Flavour
          </p>

          <h2 className="font-serif text-4xl leading-tight text-[#33251F] md:text-5xl lg:text-6xl">
            Rooted in Tradition.
            <span className="mt-2 block italic text-[#8E2922]">
              Made for Today.
            </span>
          </h2>

          <p className="mt-7 text-sm leading-8 text-[#65564C] md:text-base">
            Some flavours are more than just food. They carry memories,
            traditions and the warmth of home.
          </p>

          <p className="mt-4 text-sm leading-8 text-[#65564C] md:text-base">
            Inspired by the rich culinary heritage of Andhra Pradesh,
            Kumar Pickles celebrates the bold, tangy and spicy flavours
            that bring people together around the table.
          </p>

          <p className="mt-4 text-sm leading-8 text-[#65564C] md:text-base">
            From timeless vegetarian favourites to flavour-packed
            non-vegetarian delicacies, every recipe tells a story
            worth sharing.
          </p>

          {/* Brand Values */}
          <div className="mt-9 grid grid-cols-3 gap-4 border-y border-[#E5D8C6] py-7">

            <div>
              <Leaf size={23} className="mb-3 text-[#8E2922]" />
              <p className="text-xs font-semibold text-[#33251F]">
                Bold Flavours
              </p>
            </div>

            <div>
              <Heart size={23} className="mb-3 text-[#8E2922]" />
              <p className="text-xs font-semibold text-[#33251F]">
                Inspired by Home
              </p>
            </div>

            <div>
              <Flame size={23} className="mb-3 text-[#8E2922]" />
              <p className="text-xs font-semibold text-[#33251F]">
                Andhra Spice
              </p>
            </div>

          </div>

          {/* CTA */}
          <Link
            to="/about"
            className="mt-8 inline-flex items-center gap-3 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]"
          >
            Discover Our Story
            <ArrowUpRight size={18} />
          </Link>

        </div>
      </div>
    </section>
  );
};

export default BrandStory;
