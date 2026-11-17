import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingBag, ShieldCheck, Truck, Leaf } from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import products from "../data/products";
import { addToCart } from "../utils/cart";

const fallbackImages = {
  veg: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1100&q=85",
  "non-veg": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=1100&q=85",
};

const packSizes = ["250 g", "500 g", "1 kg"];

function ProductDetails() {
  const { id } = useParams();
  const product = products.find((item) => String(item.id) === id);
  const [selectedWeight, setSelectedWeight] = useState("250 g");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return <><Navbar /><main className="grid min-h-[55vh] place-items-center bg-[#FAF5EB] px-5 text-center"><div><h1 className="font-serif text-3xl text-[#33251F]">Product not found</h1><Link to="/shop" className="mt-6 inline-flex bg-[#8E2922] px-6 py-3 text-sm font-semibold text-white">Back to Shop</Link></div></main><Footer /></>;
  }

  const image = product.image || fallbackImages[product.category];
  const selectedPrice = product.prices?.[selectedWeight] ?? 0;
  const formatPrice = (amount) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
  const handleAddToCart = () => {
    addToCart(product, selectedWeight, quantity);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#FAF5EB] px-5 py-9 lg:px-10 lg:py-14">
        <div className="mx-auto max-w-7xl">
          <Link to="/shop" className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#8E2922] hover:text-[#702019]"><ArrowLeft size={16} /> Back to Shop</Link>
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <div className="relative overflow-hidden bg-[#E8DDCE]">
                <img src={image} alt={product.name} className="aspect-[4/4.4] w-full object-cover" />
                <span className={`absolute left-4 top-4 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white ${product.category === "veg" ? "bg-[#58613B]" : "bg-[#8E2922]"}`}>{product.category === "veg" ? "Vegetarian Pickle" : "Non-Vegetarian Pickle"}</span>
                {product.featured && <span className="absolute bottom-4 left-4 bg-[#FAF5EB] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8E2922]">Shadruchulu Signature</span>}
              </div>
              <p className="mt-3 text-center text-xs text-[#8A7A6A]">Product photography and additional images will be updated with the final brand catalogue.</p>
            </div>

            <section className="lg:pt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8E2922]">Authentic Andhra Flavours</p>
              <h1 className="mt-4 font-serif text-4xl leading-tight text-[#33251F] md:text-5xl">{product.name}</h1>
              <p className="mt-5 text-sm leading-8 text-[#65564C]">{product.description}</p>

              <div className="mt-7 border-y border-[#E5D8C6] py-5">
                <p className="font-serif text-3xl text-[#8E2922]">{formatPrice(selectedPrice)}</p>
                <p className="mt-1 text-xs leading-6 text-[#827365]">Sample price · Final selling price to be confirmed by the brand.</p>
              </div>

              <div className="mt-7">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-[#33251F]">Choose your pack</h2>
                  <span className="text-xs text-[#8A7A6A]">Sample pack options</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {packSizes.map((size) => (
                    <button key={size} type="button" onClick={() => setSelectedWeight(size)} className={`border px-3 py-4 text-sm font-semibold transition ${selectedWeight === size ? "border-[#8E2922] bg-[#8E2922] text-white" : "border-[#D9C9B5] bg-white text-[#65564C] hover:border-[#8E2922]"}`}>
                      <span className="block">{size}</span>
                      <span className={`mt-2 block text-xs ${selectedWeight === size ? "text-white/90" : "text-[#8E2922]"}`}>{formatPrice(product.prices?.[size] ?? 0)}</span>
                      {selectedWeight === size && <Check size={14} className="mx-auto mt-2" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-7 flex flex-wrap items-end gap-5">
                <div>
                  <h2 className="mb-3 text-sm font-semibold text-[#33251F]">Quantity</h2>
                  <div className="flex h-12 items-center border border-[#D9C9B5] bg-white">
                    <button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))} className="px-4 text-[#8E2922]"><Minus size={15} /></button>
                    <span className="min-w-8 text-center text-sm font-semibold text-[#33251F]">{quantity}</span>
                    <button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(20, value + 1))} className="px-4 text-[#8E2922]"><Plus size={15} /></button>
                  </div>
                </div>
                <button type="button" onClick={handleAddToCart} className={`inline-flex h-12 flex-1 items-center justify-center gap-3 px-6 text-sm font-semibold text-white transition ${added ? "bg-[#58613B]" : "bg-[#8E2922] hover:bg-[#702019]"}`}>
                  {added ? <><Check size={17} /> Added to Cart</> : <><ShoppingBag size={17} /> Add to Cart</>}
                </button>
              </div>

              <div className="mt-8 grid gap-4 border-t border-[#E5D8C6] pt-6 sm:grid-cols-2">
                <div className="flex items-start gap-3"><Leaf size={19} className="mt-1 shrink-0 text-[#8E2922]" /><div><p className="text-sm font-semibold text-[#33251F]">Traditional flavours</p><p className="mt-1 text-xs leading-5 text-[#827365]">Inspired by Andhra home-style recipes.</p></div></div>
                <div className="flex items-start gap-3"><ShieldCheck size={19} className="mt-1 shrink-0 text-[#8E2922]" /><div><p className="text-sm font-semibold text-[#33251F]">Carefully packed</p><p className="mt-1 text-xs leading-5 text-[#827365]">Packaging details will be confirmed.</p></div></div>
                <div className="flex items-start gap-3"><Truck size={19} className="mt-1 shrink-0 text-[#8E2922]" /><div><p className="text-sm font-semibold text-[#33251F]">Delivery details</p><p className="mt-1 text-xs leading-5 text-[#827365]">Shipping information coming soon.</p></div></div>
              </div>
              {added && <p className="mt-5 text-sm text-[#58613B]">{quantity} × {selectedWeight} {product.name} added. <Link to="/cart" className="font-semibold underline">View cart</Link></p>}
            </section>
          </div>
          <div className="mt-16 border-t border-[#E5D8C6] pt-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#8E2922]">A little taste of home</p>
            <h2 className="mt-3 font-serif text-3xl text-[#33251F]">Bring Andhra to your table.</h2>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-3 border border-[#8E2922] px-6 py-3 text-sm font-semibold text-[#8E2922] hover:bg-[#8E2922] hover:text-white">Explore More Pickles <ArrowRight size={16} /></Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default ProductDetails;
