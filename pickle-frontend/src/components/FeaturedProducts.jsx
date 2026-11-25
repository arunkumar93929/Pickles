
import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProducts } from "../services/productService";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();

        if (isMounted) {
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err.response?.data?.message ||
            "Unable to load products. Please try again later."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Display explicitly featured products when available.
  // Otherwise, display the first four products.
  const featuredProducts = (
    products.some((product) => product.featured === true)
      ? products.filter((product) => product.featured === true)
      : products
  ).slice(0, 4);

  return (
    <section className="bg-[#F3E9D8] px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">

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

        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-2 md:gap-7 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#E8DDCE]" />
                <div className="mt-4 h-5 w-3/4 bg-[#E8DDCE]" />
                <div className="mt-3 h-4 w-full bg-[#E8DDCE]" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#8E2922]">{error}</p>
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-[#65564C]">
              No products are available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-2 md:gap-x-7 lg:grid-cols-4">

            {featuredProducts.map((product) => {
              const image = product.images?.[0]?.url || product.image || "";
              const isVeg = product.category?.toLowerCase() === "veg";

              return (
                <Link
                  to={`/product/${product._id}`}
                  key={product._id}
                  className="group"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#E8DDCE]">

                    {image ? (
                      <img
                        src={image}
                        alt={product.name}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-[#65564C]">
                        Image unavailable
                      </div>
                    )}

                    <span
                      className={`absolute left-3 top-3 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
                        isVeg
                          ? "bg-[#58613B] text-white"
                          : "bg-[#8E2922] text-white"
                      }`}
                    >
                      {isVeg ? "Veg" : "Non-Veg"}
                    </span>

                    <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF5EB] text-[#8E2922] opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <ArrowUpRight size={20} />
                    </span>
                  </div>

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
              );
            })}

          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
