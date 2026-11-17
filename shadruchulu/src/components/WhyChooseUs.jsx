
import {
  CookingPot,
  Leaf,
  Heart,
  Flame,
} from "lucide-react";

const features = [
  {
    icon: CookingPot,
    number: "01",
    title: "Inspired by Tradition",
    description:
      "Celebrating the timeless culinary heritage and bold flavours of Andhra.",
  },
  {
    icon: Leaf,
    number: "02",
    title: "Flavourful Ingredients",
    description:
      "A celebration of the ingredients and spices that make every pickle special.",
  },
  {
    icon: Heart,
    number: "03",
    title: "Made to Be Shared",
    description:
      "Bringing families and friends together over memorable meals.",
  },
  {
    icon: Flame,
    number: "04",
    title: "A Bold Taste of Andhra",
    description:
      "Tangy, spicy and unforgettable flavours inspired by Andhra cuisine.",
  },
];

const WhyChooseUs = () => {
  return (
    <section className="bg-[#75231E] px-5 py-20 text-[#FAF5EB] lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">

        <div className="mx-auto mb-16 max-w-2xl text-center">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#E9BC76]">
            The Shadruchulu Difference
          </p>

          <h2 className="font-serif text-4xl leading-tight md:text-5xl">
            More Than a Pickle.
            <span className="block italic text-[#E9BC76]">
              It's a Tradition.
            </span>
          </h2>

          <p className="mt-6 text-sm leading-7 text-white/70 md:text-base">
            Every flavour has a story. Discover what makes the
            world of Shadruchulu special.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">

          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.number}
                className="group border-t border-white/25 pt-8 transition-all duration-300 hover:-translate-y-2"
              >
                <div className="mb-9 flex items-center justify-between">
                  <Icon
                    size={32}
                    strokeWidth={1.3}
                    className="text-[#E9BC76] transition-transform duration-300 group-hover:scale-110"
                  />

                  <span className="font-serif text-sm text-white/40">
                    {feature.number}
                  </span>
                </div>

                <h3 className="font-serif text-2xl text-[#FAF5EB]">
                  {feature.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-white/65">
                  {feature.description}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
