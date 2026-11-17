import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpRight, Search, SlidersHorizontal, X } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import products from "../data/products";

const fallbackImages = {
  veg: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=85",
  "non-veg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=85",
};

function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") || "all";
  const search = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(search);
  const [sort, setSort] = useState("featured");

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === "all" || product.category === category;
      const matchesSearch = `${product.name} ${product.description}`.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sort === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "za") filtered.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "featured") filtered.sort((a, b) => Number(b.featured) - Number(a.featured));
    if (sort === "category") filtered.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
    return filtered;
  }, [category, search, sort]);

  const updateCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === "all") next.delete("category");
    else next.set("category", value);
    setSearchParams(next);
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput.trim()) next.set("search", searchInput.trim());
    else next.delete("search");
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSort("featured");
    setSearchParams({});
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF5EB]">
        <section className="bg-[#F3E9D8] px-5 py-16 text-center md:py-20">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">The Shadruchulu Collection</p>
          <h1 className="font-serif text-4xl text-[#33251F] md:text-6xl">Shop Our <span className="italic text-[#8E2922]">Pickles.</span></h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#65564C]">Discover traditional Andhra flavours, from tangy vegetarian favourites to bold non-vegetarian delicacies.</p>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-12 lg:px-10 lg:py-16">
          <div className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-[#8E2922]">Made for your table</p>
              <h2 className="mt-2 font-serif text-3xl text-[#33251F]">{search ? `Search results for “${search}”` : "Our Pickle Pantry"}</h2>
              <p className="mt-2 text-sm text-[#65564C]">{visibleProducts.length} {visibleProducts.length === 1 ? "product" : "products"}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <form onSubmit={submitSearch} className="flex min-w-0 border border-[#D9C9B5] bg-white sm:w-64">
                <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search pickles..." aria-label="Search pickles" className="min-w-0 flex-1 bg-transparent px-4 py-3 text-sm text-[#33251F] outline-none placeholder:text-[#9A8A7A]" />
                {searchInput && <button type="button" onClick={() => { setSearchInput(""); const next = new URLSearchParams(searchParams); next.delete("search"); setSearchParams(next); }} aria-label="Clear search" className="px-2 text-[#8E2922]"><X size={16} /></button>}
                <button type="submit" aria-label="Submit search" className="bg-[#8E2922] px-4 text-white"><Search size={17} /></button>
              </form>
              <label className="flex items-center gap-2 border border-[#D9C9B5] bg-white px-3 text-sm text-[#65564C]">
                <SlidersHorizontal size={16} className="text-[#8E2922]" />
                <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Sort products" className="bg-transparent py-3 pr-2 outline-none">
                  <option value="featured">Featured</option>
                  <option value="az">Name: A to Z</option>
                  <option value="za">Name: Z to A</option>
                  <option value="category">Group by category</option>
                </select>
              </label>
            </div>
          </div>

          <div className="mb-9 flex flex-wrap items-center gap-2 text-sm">
            {[["all", "All Pickles"], ["veg", "Vegetarian"], ["non-veg", "Non-Vegetarian"]].map(([value, label]) => (
              <button key={value} type="button" onClick={() => updateCategory(value)} className={`border px-4 py-2.5 transition ${category === value ? "border-[#8E2922] bg-[#8E2922] text-white" : "border-[#D9C9B5] text-[#65564C] hover:border-[#8E2922] hover:text-[#8E2922]"}`}>
                {label}
              </button>
            ))}
            {(category !== "all" || search) && <button type="button" onClick={clearFilters} className="ml-1 inline-flex items-center gap-1 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-[#8E2922]">Clear filters <X size={13} /></button>}
          </div>

          {visibleProducts.length ? (
            <div className="grid grid-cols-2 gap-x-4 gap-y-9 md:grid-cols-3 md:gap-x-7 lg:grid-cols-4">
              {visibleProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden bg-[#E8DDCE]">
                    <img src={product.image || fallbackImages[product.category]} alt={product.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                    <span className={`absolute left-3 top-3 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white ${product.category === "veg" ? "bg-[#58613B]" : "bg-[#8E2922]"}`}>{product.category === "veg" ? "Veg" : "Non-Veg"}</span>
                    {product.featured && <span className="absolute bottom-3 left-3 bg-[#FAF5EB] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#8E2922]">Signature</span>}
                    <span className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF5EB] text-[#8E2922] opacity-0 transition group-hover:opacity-100"><ArrowUpRight size={19} /></span>
                  </div>
                  <h3 className="mt-4 font-serif text-lg text-[#33251F] group-hover:text-[#8E2922]">{product.name}</h3>
                  <p className="mt-2 line-clamp-2 text-xs leading-6 text-[#65564C]">{product.description}</p>
                  <p className="mt-3 font-serif text-lg text-[#8E2922]">From ₹{Math.min(...Object.values(product.prices || { "250 g": 0 }))}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-[#8A7A6A]">Sample price · View product <span aria-hidden="true">→</span></p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <h3 className="font-serif text-2xl text-[#33251F]">No pickles found</h3>
              <p className="mt-3 text-sm text-[#65564C]">Try another search or view our full collection.</p>
              <button onClick={clearFilters} className="mt-6 bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white">View all pickles</button>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Shop;
