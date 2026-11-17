import { Link, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const pageContent = {
  "/contact": ["Contact Us", "We'd love to hear from you. Contact details and customer support options will be added here."],
  "/shipping": ["Shipping Information", "Shipping locations, delivery timelines and charges will be published here once store operations are finalised."],
  "/returns": ["Returns & Refunds", "Our returns and refund policy will be added here before the store goes live."],
  "/privacy": ["Privacy Policy", "Our privacy policy will explain how customer information is collected, used and protected."],
  "/terms": ["Terms & Conditions", "The terms and conditions for using the Shadruchulu store will be published here."],
};

function InfoPage({ notFound = false }) {
  const location = useLocation();
  const [title, description] = notFound ? ["Page not found", "The page you are looking for doesn't exist or may have moved."] : (pageContent[location.pathname] || ["Information", "This page is being prepared."]);

  return (
    <>
      <Navbar />
      <main className="grid min-h-[55vh] place-items-center bg-[#FAF5EB] px-5 py-16 text-center">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#8E2922]">Shadruchulu</p>
          <h1 className="mt-4 font-serif text-4xl text-[#33251F] md:text-5xl">{title}</h1>
          <p className="mt-5 text-sm leading-7 text-[#65564C]">{description}</p>
          <Link to="/" className="mt-8 inline-flex bg-[#8E2922] px-7 py-4 text-sm font-semibold text-white hover:bg-[#702019]">Back to Home</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default InfoPage;
