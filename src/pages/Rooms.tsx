import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import SearchBar from "@/components/SearchBar";
import RoomList from "@/components/RoomList";
import HowItWorks from "@/components/HowItWorks";
import OwnerBanner from "@/components/OwnerBanner";
import AppDownload from "@/components/AppDownload";
import Footer from "@/components/Footer";

const Rooms = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <div>
                <SearchBar />
            </div>
            <RoomList />
            <HowItWorks />
            <AppDownload />
            <OwnerBanner />
            <Footer />
        </div>
    );
};

export default Rooms;
