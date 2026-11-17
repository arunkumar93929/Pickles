import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Menu, X, ShoppingBag, Search, UserRound, ArrowRight } from "lucide-react";
import { getCartCount } from "../utils/cart";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Shop All", path: "/shop" },
  { name: "Veg Pickles", path: "/shop?category=veg" },
  { name: "Non-Veg Pickles", path: "/shop?category=non-veg" },
  { name: "Our Story", path: "/about" },
];

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartCount, setCartCount] = useState(() => getCartCount());
  const navigate = useNavigate();

  useEffect(() => {
    const refreshCartCount = () => setCartCount(getCartCount());
    window.addEventListener("shadruchulu-cart-updated", refreshCartCount);
    window.addEventListener("storage", refreshCartCount);
    return () => {
      window.removeEventListener("shadruchulu-cart-updated", refreshCartCount);
      window.removeEventListener("storage", refreshCartCount);
    };
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/shop?search=${encodeURIComponent(query)}` : "/shop");
    setSearchOpen(false);
    setSearchTerm("");
    setMenuOpen(false);
  };

  const linkClass = ({ isActive }) =>
    `text-sm font-medium transition hover:text-[#A52D22] ${isActive ? "text-[#A52D22]" : "text-[#33251F]"}`;

  return (
    <header className="sticky top-0 z-50 bg-[#FAF5EB] shadow-sm">
      <div className="bg-[#8E2922] px-3 py-2 text-center text-[10px] tracking-wider text-white sm:text-xs">A TASTE OF ANDHRA, DELIVERED TO YOUR DOORSTEP</div>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-5 lg:px-10">
        <button type="button" className="lg:hidden" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>{menuOpen ? <X size={24} /> : <Menu size={24} />}</button>
        <Link to="/" onClick={() => setMenuOpen(false)} className="shrink-0 text-xl font-bold tracking-wider text-[#8E2922] sm:text-2xl">SHADRUCHULU<span className="text-[#D5A34D]">.</span><span className="mt-1 block text-[8px] tracking-[0.25em] text-[#65564C] sm:text-[9px]">AUTHENTIC ANDHRA FLAVOURS</span></Link>
        <nav className="hidden items-center gap-5 xl:gap-7 lg:flex">{navLinks.map((link) => <NavLink key={link.name} to={link.path} end={link.path === "/"} className={linkClass}>{link.name}</NavLink>)}</nav>
        <div className="flex shrink-0 items-center gap-3 text-[#33251F] sm:gap-4">
          <button type="button" aria-label="Open product search" aria-expanded={searchOpen} onClick={() => setSearchOpen((open) => !open)} className="transition hover:text-[#8E2922]">{searchOpen ? <X size={20} /> : <Search size={20} />}</button>
          <Link to="/account" aria-label="Your account" className="hidden transition hover:text-[#8E2922] sm:block"><UserRound size={20} /></Link>
          <Link to="/cart" aria-label={`Shopping cart, ${cartCount} items`} className="relative transition hover:text-[#8E2922]"><ShoppingBag size={21} />{cartCount > 0 && <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#8E2922] px-1 text-[9px] font-bold text-white">{cartCount}</span>}</Link>
        </div>
      </div>
      {searchOpen && <form onSubmit={handleSearch} className="border-t border-[#E8DDCE] bg-[#FAF5EB] px-5 py-4"><div className="mx-auto flex max-w-2xl gap-2"><input autoFocus value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search Avakaya, Gongura, Chicken..." aria-label="Search pickles" className="min-w-0 flex-1 border border-[#D9C9B5] bg-white px-4 py-3 text-sm outline-none focus:border-[#8E2922]" /><button type="submit" className="inline-flex items-center gap-2 bg-[#8E2922] px-4 py-3 text-sm font-semibold text-white hover:bg-[#702019]">Search <ArrowRight size={16} /></button></div></form>}
      {menuOpen && <nav className="border-t border-[#E8DDCE] bg-[#FAF5EB] px-6 py-5 lg:hidden"><div className="flex flex-col gap-5">{navLinks.map((link) => <NavLink key={link.name} to={link.path} end={link.path === "/"} onClick={() => setMenuOpen(false)} className={linkClass}>{link.name}</NavLink>)}<Link to="/account" onClick={() => setMenuOpen(false)} className="text-sm font-medium text-[#33251F] hover:text-[#8E2922]">My Account</Link></div></nav>}
    </header>
  );
};

export default Navbar;
