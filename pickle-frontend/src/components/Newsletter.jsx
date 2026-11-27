
import { useState } from "react";
import { ArrowRight } from "lucide-react";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email.trim()) return;

    setMessage("Thanks for your interest! Newsletter integration is coming soon.");
    setEmail("");
  };

  return (
    <section className="bg-[#FAF5EB] px-5 py-20 lg:px-10 lg:py-24">
      <div className="mx-auto max-w-5xl bg-[#EDE0CC] px-6 py-14 text-center md:px-16 md:py-20">

        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">
          A Little Something from Us
        </p>

        <h2 className="font-serif text-4xl leading-tight text-[#33251F] md:text-5xl">
          A Taste of Tradition,
          <span className="block italic text-[#8E2922]">
            Straight to Your Inbox.
          </span>
        </h2>

        <p className="mx-auto mt-5 max-w-lg text-sm leading-7 text-[#65564C]">
          Stay connected with our latest flavours, updates
          and stories from the world of Kumar Pickles.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mx-auto mt-9 flex max-w-xl flex-col gap-3 sm:flex-row"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="min-w-0 flex-1 border border-[#D9C9B5] bg-[#FAF5EB] px-5 py-4 text-sm text-[#33251F] outline-none focus:border-[#8E2922]"
          />

          <button
            type="submit"
            className="flex items-center justify-center gap-3 bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white transition hover:bg-[#702019]"
          >
            Subscribe
            <ArrowRight size={17} />
          </button>
        </form>

        {message && (
          <p role="status" className="mt-5 text-sm text-[#58613B]">
            {message}
          </p>
        )}

        <p className="mt-5 text-xs text-[#89796B]">
          No spam. Just a little taste of goodness.
        </p>

      </div>
    </section>
  );
};

export default Newsletter;
