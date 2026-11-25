
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import CategorySection from "../components/CategorySection";
import FeaturedProducts from "../components/FeaturedProducts";
import BrandStory from "../components/BrandStory";
import WhyChooseUs from "../components/WhyChooseUs";
import Testimonials from "../components/Testimonials";
import Newsletter from "../components/Newsletter";
import Footer from "../components/Footer";

function Home() {
  return (
    <>
      <div id="top">
        <Navbar />
      </div>

      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <BrandStory />
        <WhyChooseUs />
        <Testimonials />
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}

export default Home;
