
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Priya Reddy",
    location: "Hyderabad",
    review:
      "The flavours remind me of the traditional pickles we used to enjoy at home. Absolutely delicious!",
  },
  {
    name: "Rahul Varma",
    location: "Vijayawada",
    review:
      "If you love authentic Andhra flavours, this collection is worth exploring. Loved the spicy taste!",
  },
  {
    name: "Sneha Rao",
    location: "Bengaluru",
    review:
      "A beautiful combination of tanginess and spice. Perfect alongside a simple plate of hot rice.",
  },
];

const Testimonials = () => {
  return (
    <section className="bg-[#F3E9D8] px-5 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">

        <div className="mb-14 text-center">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">
            Words from Our Food Lovers
          </p>

          <h2 className="font-serif text-4xl text-[#33251F] md:text-5xl">
            Stories Served with
            <span className="italic text-[#8E2922]"> Love.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {testimonials.map((item) => (
            <div
              key={item.name}
              className="bg-[#FAF5EB] p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl md:p-10"
            >
              <Quote
                size={32}
                className="mb-7 text-[#D5A34D]"
              />

              <div className="mb-5 flex gap-1 text-[#D5A34D]">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={15}
                    fill="currentColor"
                  />
                ))}
              </div>

              <p className="font-serif text-xl leading-8 text-[#33251F]">
                "{item.review}"
              </p>

              <div className="mt-8 border-t border-[#E5D8C6] pt-6">
                <p className="font-semibold text-[#33251F]">
                  {item.name}
                </p>

                <p className="mt-1 text-xs text-[#8E2922]">
                  {item.location}
                </p>
              </div>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
};

export default Testimonials;
