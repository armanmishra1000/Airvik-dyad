import { mockRoomTypes } from "@/data";
import { RoomTypeCard } from "@/components/public/room-type-card";

export default function PublicHomePage() {
  return (
    <div>
      <section className="py-12 md:py-20 bg-muted/20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight font-serif">
            Experience Unmatched Comfort
          </h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            Explore our collection of beautifully designed rooms and suites,
            each offering a unique blend of luxury and tranquility.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-10">Our Rooms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockRoomTypes.map((roomType) => (
              <RoomTypeCard key={roomType.id} roomType={roomType} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}