
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    id: 1,
    title: "Vegetarian Pickles",
    subtitle: "Traditional flavours, straight from Andhra kitchens.",
    count: "06 VARIETIES",
    image:
      "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=veg",
    label: "EXPLORE VEG PICKLES",
  },
  {
    id: 2,
    title: "Non-Vegetarian Pickles",
    subtitle: "Bold, spicy flavours for the true food lovers.",
    count: "04 VARIETIES",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1200&q=85",
    link: "/shop?category=non-veg",
    label: "EXPLORE NON-VEG PICKLES",
  },
];

const CategorySection = () => {
  return (
    <section className="bg-[#FAF5EB] px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">

        {/* Section Heading */}
        <div className="mb-12 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">
            Discover Our Collection
          </p>

          <h2 className="font-serif text-4xl text-[#33251F] md:text-5xl">
            A Little Taste of
            <span className="italic text-[#8E2922]"> Tradition.</span>
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#65564C] md:text-base">
            From tangy vegetarian favourites to rich non-vegetarian
            delicacies, explore the flavours that make Andhra special.
          </p>
        </div>

        {/* Category Cards */}
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {categories.map((category) => (
            <Link
              to={category.link}
              key={category.id}
              className="group relative h-[420px] overflow-hidden bg-[#33251F] md:h-[480px]"
            >
              {/* Background Image */}
              <img
                src={category.image}
                alt={category.title}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Image Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Card Content */}
              <div className="absolute inset-x-0 bottom-0 p-7 text-white md:p-10">

                <p className="mb-3 text-xs font-semibold tracking-[0.2em] text-[#F0C77B]">
                  {category.count}
                </p>

                <h3 className="font-serif text-3xl md:text-4xl">
                  {category.title}
                </h3>

                <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                  {category.subtitle}
                </p>

                <div className="mt-7 flex items-center justify-between border-t border-white/40 pt-5">
                  <span className="text-xs font-semibold tracking-widest">
                    {category.label}
                  </span>

                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white transition-all duration-300 group-hover:bg-white group-hover:text-[#8E2922]">
                    <ArrowUpRight size={20} />
                  </span>
                </div>

              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategorySection;
