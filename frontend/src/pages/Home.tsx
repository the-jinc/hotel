import HeroSection from "../components/HeroSection";
import AboutUsSection from "../components/AboutUsSection";
import FeaturedRooms from "../components/FeaturedRooms";
import Testimonials from "../components/Testimonials";
import AmenitiesSection from "../components/AmenitiesSection";
import GalleryCTA from "../components/GalleryCTA";

const HomePage = () => {
  return (
    <div className="font-sans">
      <HeroSection />
      <AboutUsSection />
      <FeaturedRooms />
      <Testimonials />
      <AmenitiesSection />
      <GalleryCTA />
    </div>
  );
};

export default HomePage;
