
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#291D19] px-5 pb-8 pt-16 text-[#FAF5EB]">

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 border-b border-white/15 pb-14 sm:grid-cols-2 lg:grid-cols-4">

        {/* Brand */}
        <div className="lg:col-span-2">
          <Link
            to="/"
            className="font-serif text-3xl font-bold tracking-wide"
          >
            SHADRUCHULU<span className="text-[#D5A34D]">.</span>
          </Link>

          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-[#D5A34D]">
            Authentic Andhra Flavours
          </p>

          <p className="mt-7 max-w-sm text-sm leading-7 text-white/60">
            Celebrating the rich culinary heritage of Andhra
            through flavours inspired by tradition and made
            to be shared.
          </p>

          {/* Social Links */}
          <div className="mt-7 flex gap-4">
            <a
              href="https://www.instagram.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xs font-bold transition hover:bg-[#8E2922]"
            >
              IG
            </a>

            <a
              href="https://www.facebook.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-lg font-bold transition hover:bg-[#8E2922]"
            >
              f
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <h3 className="mb-7 font-serif text-xl">
            Explore
          </h3>

          <div className="flex flex-col gap-4 text-sm text-white/60">
            <Link to="/" className="transition hover:text-white">
              Home
            </Link>

            <Link to="/shop" className="transition hover:text-white">
              Shop All
            </Link>

            <Link to="/shop?category=veg" className="transition hover:text-white">
              Veg Pickles
            </Link>

            <Link to="/shop?category=non-veg" className="transition hover:text-white">
              Non-Veg Pickles
            </Link>

            <Link to="/about" className="transition hover:text-white">
              Our Story
            </Link>
          </div>
        </div>

        {/* Customer Care */}
        <div>
          <h3 className="mb-7 font-serif text-xl">
            Customer Care
          </h3>

          <div className="flex flex-col gap-4 text-sm text-white/60">
            <Link to="/contact" className="transition hover:text-white">
              Contact Us
            </Link>

            <Link to="/shipping" className="transition hover:text-white">
              Shipping Information
            </Link>

            <Link to="/returns" className="transition hover:text-white">
              Returns & Refunds
            </Link>

            <Link to="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>

            <Link to="/terms" className="transition hover:text-white">
              Terms & Conditions
            </Link>
          </div>
        </div>

      </div>

      {/* Copyright */}
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 pt-7 text-xs text-white/50 sm:flex-row sm:items-center">

        <p>
          © {new Date().getFullYear()} Shadruchulu. All rights reserved.
        </p>

        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
          className="inline-flex items-center gap-2 transition hover:text-white"
        >
          Back to top
          <ArrowUpRight size={14} />
        </a>

      </div>

    </footer>
  );
};

export default Footer;
