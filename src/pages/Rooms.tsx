import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import RoomList from "@/components/RoomList";
import HowItWorks from "@/components/HowItWorks";
import OwnerBanner from "@/components/OwnerBanner";
import Footer from "@/components/Footer";

const Rooms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <RoomList />
      <HowItWorks />
      <OwnerBanner />
      <Footer />
    </div>
  );
};

export default Rooms;
