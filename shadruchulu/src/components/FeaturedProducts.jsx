
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import products from "../data/products";

const FeaturedProducts = () => {
  const featuredProducts = products.filter(
    (product) => product.featured
  );

  return (
    <section className="bg-[#F3E9D8] px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">

        {/* Heading */}
        <div className="mb-12 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">
              Handpicked For You
            </p>

            <h2 className="font-serif text-4xl text-[#33251F] md:text-5xl">
              Our Signature
              <span className="italic text-[#8E2922]"> Pickles.</span>
            </h2>

            <p className="mt-4 max-w-lg text-sm leading-7 text-[#65564C]">
              Discover the flavours that bring the authentic taste
              of Andhra to every meal.
            </p>
          </div>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#8E2922] transition hover:gap-4"
          >
            VIEW ALL PRODUCTS
            <ArrowRight size={17} />
          </Link>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-2 md:gap-x-7 lg:grid-cols-4">

          {featuredProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              key={product.id}
              className="group"
            >
              {/* Product Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-[#E8DDCE]">

                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Category Badge */}
                <span
                  className={`absolute left-3 top-3 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                    product.category === "veg"
                      ? "bg-[#58613B] text-white"
                      : "bg-[#8E2922] text-white"
                  }`}
                >
                  {product.category === "veg" ? "Veg" : "Non-Veg"}
                </span>

                {/* Explore Icon */}
                <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF5EB] text-[#8E2922] opacity-0 transition-all duration-300 group-hover:opacity-100">
                  <ArrowUpRight size={20} />
                </span>
              </div>

              {/* Product Information */}
              <div className="pt-4">
                <h3 className="font-serif text-lg text-[#33251F] transition-colors group-hover:text-[#8E2922] md:text-xl">
                  {product.name}
                </h3>

                <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#65564C]">
                  {product.description}
                </p>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#8E2922]">
                  Explore Product →
                </p>
              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
