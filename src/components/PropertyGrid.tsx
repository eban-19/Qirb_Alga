import PropertyCard from "./PropertyCard";
import room1 from "@/assets/room-1.png";
import room2 from "@/assets/room-2.png";
import room3 from "@/assets/room-3.png";
import room4 from "@/assets/room-4.png";
import room5 from "@/assets/room-5.png";
import room6 from "@/assets/room-6.png";
import { useLanguage } from "@/hooks/use-language";

const basePensions = [
  {
    id: 1,
    image: room1,
    distance: "0.8 km",
    price: 450,
    rating: 4.5,
    roomsLeft: 5,
  },
  {
    id: 2,
    image: room2,
    distance: "1.2 km",
    price: 350,
    rating: 4.2,
    roomsLeft: 2,
  },
  {
    id: 3,
    image: room3,
    distance: "1.5 km",
    price: 600,
    rating: 4.8,
    roomsLeft: 1,
  },
  {
    id: 4,
    image: room4,
    distance: "2.0 km",
    price: 280,
    rating: 3.9,
    roomsLeft: 8,
  },
  {
    id: 5,
    image: room5,
    distance: "2.3 km",
    price: 520,
    rating: 4.6,
    roomsLeft: 3,
  },
  {
    id: 6,
    image: room6,
    distance: "3.1 km",
    price: 380,
    rating: 4.1,
    roomsLeft: 6,
  },
];

const PropertyGrid = () => {
  const { t } = useLanguage();
  const pensions = basePensions.map((pension, index) => ({
    ...pension,
    name: t.propertyGrid.items[index].name,
    address: t.propertyGrid.items[index].address,
  }));

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">
            {t.propertyGrid.title}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t.propertyGrid.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pensions.map((pension) => (
            <PropertyCard key={pension.id} {...pension} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PropertyGrid;
