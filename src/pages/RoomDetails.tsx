import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RoomProfile from "@/components/RoomProfile";
import { useRoomById } from "@/hooks/use-rooms";
import { useLanguage } from "@/hooks/use-language";
import { useParams } from "react-router-dom";

const RoomDetails = () => {
  const { id = "" } = useParams();
  const { data: room, isLoading } = useRoomById(id);
  const { t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      {isLoading ? (
        <main className="pt-24 pb-16 text-center text-muted-foreground">{t.rooms.loadingProfile}</main>
      ) : room ? (
        <RoomProfile room={room} />
      ) : (
        <main className="pt-24 pb-16 text-center text-muted-foreground">{t.rooms.notFound}</main>
      )}
      <Footer />
    </div>
  );
};

export default RoomDetails;
