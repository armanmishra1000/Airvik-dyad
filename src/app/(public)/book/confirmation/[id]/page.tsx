// "use client";

// import { useParams, notFound } from "next/navigation";
// import { format, parseISO, differenceInDays } from "date-fns";
// import {
//   CheckCircle2,
//   MapPin,
//   Phone,
//   Mail,
//   User,
//   BedDouble,
//   CalendarDays,
//   DollarSign,
//   Copy,
// } from "lucide-react";
// import Link from "next/link";
// import { toast } from "sonner";

// import { useDataContext } from "@/context/data-context";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";

// export default function BookingConfirmationPage() {
//   const params = useParams<{ id: string }>();
//   const { property, reservations, guests, rooms, roomTypes } = useDataContext();

//   const reservation = reservations.find((r) => r.id === params.id);

//   if (!reservation) {
//     return notFound();
//   }

//   const guest = guests.find((g) => g.id === reservation.guestId);
//   const room = rooms.find((r) => r.id === reservation.roomId);
//   const roomType = roomTypes.find((rt) => rt.id === room?.roomTypeId);
//   const nights = differenceInDays(
//     parseISO(reservation.checkOutDate),
//     parseISO(reservation.checkInDate)
//   );

//   const handleCopyToClipboard = () => {
//     navigator.clipboard.writeText(reservation.id);
//     toast.success("Reservation ID copied to clipboard!");
//   };

//   return (
//     <div className="bg-muted/40 min-h-screen">
//       <div className="container mx-auto px-4 py-10">
//         <div className="max-w-5xl mx-auto">
//           <div className="text-center mb-12">
//             <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
//             <h1 className="text-4xl font-bold font-serif mt-4">
//               Booking Confirmed!
//             </h1>
//             <p className="text-muted-foreground mt-2 text-lg">
//               Thank you, {guest?.firstName}! Your stay at {property.name} is
//               booked.
//             </p>
//           </div>

//           <div className="grid md:grid-cols-3 gap-8">
//             {/* Left column: Reservation Details */}
//             <div className="md:col-span-2">
//               <Card className="h-full">
//                 <CardHeader>
//                   <CardTitle className="text-foreground font-serif">Your Reservation</CardTitle>
//                   <CardDescription className="flex items-center gap-2 pt-1">
//                     <span>Reservation ID: {reservation.id}</span>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="h-6 w-6"
//                       onClick={handleCopyToClipboard}
//                     >
//                       <Copy className="h-4 w-4" />
//                     </Button>
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <div className="flex flex-col sm:flex-row items-start gap-4">
//                     <div className="relative w-full sm:w-40 h-32 rounded-lg overflow-hidden flex-shrink-0">
//                       <img
//                         src={
//                           roomType?.mainPhotoUrl ||
//                           roomType?.photos?.[0] ||
//                           "/room-placeholder.svg"
//                         }
//                         alt={roomType?.name || "Room"}
//                         className="absolute inset-0 h-full w-full object-cover"
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <h3 className="text-xl font-semibold">
//                         {roomType?.name}
//                       </h3>
//                       <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-2">
//                         <div className="flex items-center gap-2">
//                           <User className="h-4 w-4" />
//                           <span>
//                             {guest?.firstName} {guest?.lastName}
//                           </span>
//                         </div>
//                         <div className="flex items-center gap-2">
//                           <BedDouble className="h-4 w-4" />
//                           <span>{reservation.numberOfGuests} Guest(s)</span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                   <Separator className="my-6" />
//                   <div className="grid sm:grid-cols-2 gap-6">
//                     <div>
//                       <h4 className="font-semibold mb-2 flex items-center gap-2">
//                         <CalendarDays className="h-4 w-4 text-primary" />
//                         Check-in
//                       </h4>
//                       <p className="text-lg font-medium">
//                         {format(
//                           parseISO(reservation.checkInDate),
//                           "E, MMM d, yyyy"
//                         )}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         From 12:00 PM
//                       </p>
//                     </div>
//                     <div>
//                       <h4 className="font-semibold mb-2 flex items-center gap-2">
//                         <CalendarDays className="h-4 w-4 text-primary" />
//                         Check-out
//                       </h4>
//                       <p className="text-lg font-medium">
//                         {format(
//                           parseISO(reservation.checkOutDate),
//                           "E, MMM d, yyyy"
//                         )}
//                       </p>
//                       <p className="text-sm text-muted-foreground">
//                         Until 11:00 AM
//                       </p>
//                     </div>
//                   </div>
//                   <Separator className="my-6" />
//                   <div>
//                     <h4 className="font-semibold mb-2 flex items-center gap-2">
//                       <DollarSign className="h-4 w-4 text-primary" />
//                       Total Price
//                     </h4>
//                     <p className="text-2xl font-bold">
//                       ${reservation.totalAmount.toFixed(2)}
//                     </p>
//                     <p className="text-sm text-muted-foreground">
//                       For {nights} night(s)
//                     </p>
//                   </div>
//                 </CardContent>
//               </Card>
//             </div>

//             {/* Right column: Hotel Info & What's Next */}
//             <div className="md:col-span-1">
//               <Card className="h-full">
//                 <CardHeader>
//                   <CardTitle className="text-foreground font-serif">Hotel Information</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3 text-sm">
//                   <p className="font-bold text-base">SAHAJANAND WELLNESS</p>
//                   <div className="flex items-start gap-3 text-muted-foreground">
//                     <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                     <span>
//                       Street No.12, Shisham Jhadi, Muni Ki Reti, Near Ganga
//                       Kinare, Rishikesh U.K Pin Code: 249201
//                     </span>
//                   </div>
//                   <div className="flex items-center gap-3 text-muted-foreground">
//                     <Phone className="h-4 w-4" />
//                     <span>+91 8511151708</span>
//                   </div>
//                   <div className="aspect-video w-full overflow-hidden rounded-lg border mt-4">
//                     <iframe
//                       src={property.google_maps_url}
//                       width="100%"
//                       height="100%"
//                       style={{ border: 0 }}
//                       allowFullScreen={false}
//                       loading="lazy"
//                       referrerPolicy="no-referrer-when-downgrade"
//                     ></iframe>
//                   </div>
//                 </CardContent>
//                 <Separator className="my-4" />
//                 <CardHeader className="pt-0">
//                   <CardTitle>What's Next?</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-3 text-sm text-muted-foreground pt-0">
//                   <div className="flex items-start gap-3">
//                     <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
//                     <span>
//                       A confirmation email has been sent to{" "}
//                       <strong className="text-foreground">
//                         {guest?.email}
//                       </strong>
//                       .
//                     </span>
//                   </div>
//                   <p>
//                     Please contact us for any special requests or questions
//                     about your stay.
//                   </p>
//                 </CardContent>
//               </Card>
//             </div>
//           </div>
//           <div className="text-center mt-10">
//             <Button asChild size="lg" className="h-12 px-10 rounded-lg">
//               <Link href="/">Back to Home</Link>
//             </Button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import * as React from "react";
import { useParams, notFound } from "next/navigation";
import { format, parseISO, differenceInDays } from "date-fns";
import {
  CheckCircle2,
  MapPin,
  Phone,
  Mail,
  User,
  BedDouble,
  CalendarDays,
  IndianRupee,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import { useDataContext } from "@/context/data-context";
import { getGuestById } from "@/lib/api";
import type { Guest } from "@/data/types";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function BookingConfirmationPage() {
  const params = useParams<{ id: string }>();
  const { property, reservations, guests, rooms, roomTypes, ratePlans } = useDataContext();
  const [guestData, setGuestData] = React.useState<Guest | null>(null);
  const [isLoadingGuest, setIsLoadingGuest] = React.useState(false);

  const reservation = reservations.find((r) => r.id === params.id);
  const guestFromContext = reservation ? guests.find((g) => g.id === reservation.guestId) : undefined;
  const guest = guestData || guestFromContext;
  
  // Get room and room type data before early return
  const room = reservation ? rooms.find((r) => r.id === reservation.roomId) : undefined;
  const roomType = room ? roomTypes.find((rt) => rt.id === room.roomTypeId) : undefined;
  
  // Calculate nightly rate with proper fallbacks (matching review page logic)
  const nightlyRate = React.useMemo(() => {
    if (!reservation) return 3000;
    
    // Priority 1: Use rate plan price
    if (ratePlans.length > 0) {
      const ratePlan = ratePlans.find((rp) => rp.id === reservation.ratePlanId);
      if (ratePlan?.price && ratePlan.price > 0) {
        return ratePlan.price;
      }
    }
    
    // Priority 2: Use room type price
    if (roomType?.price && roomType.price > 0) {
      return roomType.price;
    }
    
    // Priority 3: Default fallback (matches single room page default)
    return 3000;
  }, [ratePlans, reservation, roomType]);

  // Calculate prices matching review page logic
  const nights = reservation ? differenceInDays(
    parseISO(reservation.checkOutDate),
    parseISO(reservation.checkInDate)
  ) : 0;
  const totalCost = nights * nightlyRate;
  const taxesAndFees = totalCost * 0.18;
  const grandTotal = totalCost + taxesAndFees;
  
  // Fetch guest directly if not in context
  React.useEffect(() => {
    if (reservation && !guestFromContext && reservation.guestId && !guestData && !isLoadingGuest) {
      setIsLoadingGuest(true);
      getGuestById(reservation.guestId)
        .then(({ data }) => {
          if (data) {
            setGuestData(data);
          }
        })
        .catch((error) => {
          console.error("Failed to fetch guest:", error);
        })
        .finally(() => {
          setIsLoadingGuest(false);
        });
    }
  }, [reservation, guestFromContext, guestData, isLoadingGuest]);

  if (!reservation) {
    return notFound();
  }

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(reservation.id);
    toast.success("Reservation ID copied to clipboard!");
  };

  return (
    <div className="bg-muted/40 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <h1 className="text-4xl font-bold font-serif text-foreground mt-4">
              Booking Confirmed!
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              Thank you, {guest?.firstName}! Your stay at {property.name} is
              booked.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Left column: Reservation Details */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-foreground font-serif">Your Reservation</CardTitle>
                  <CardDescription className="flex items-center gap-2 pt-1">
                    <span>Reservation ID: {reservation.id}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={handleCopyToClipboard}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    <div className="relative w-full sm:w-40 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={
                          roomType?.mainPhotoUrl ||
                          roomType?.photos?.[0] ||
                          "/room-placeholder.svg"
                        }
                        alt={roomType?.name || "Room"}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {roomType?.name}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mt-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>
                            {guest?.firstName} {guest?.lastName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <BedDouble className="h-4 w-4" />
                          <span>{reservation.numberOfGuests} Guest(s)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Check-in
                      </h4>
                      <p className="text-lg font-medium">
                        {format(
                          parseISO(reservation.checkInDate),
                          "E, MMM d, yyyy"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        From 12:00 PM
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Check-out
                      </h4>
                      <p className="text-lg font-medium">
                        {format(
                          parseISO(reservation.checkOutDate),
                          "E, MMM d, yyyy"
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Until 11:00 AM
                      </p>
                    </div>
                  </div>
                  <Separator className="my-6" />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <IndianRupee className="h-4 w-4 text-primary" />
                      Your total price
                    </h4>
                    <div className="space-y-3 p-4 bg-orange-50 rounded-xl">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">₹{nightlyRate.toLocaleString('en-IN')} × {nights} night{nights > 1 ? 's' : ''}</span>
                        <span className="font-medium text-gray-900">₹{totalCost.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Taxes & fees</span>
                        <span className="font-medium text-gray-900">₹{Math.round(taxesAndFees).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-gray-900">Total</span>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-primary">₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
                            <p className="text-xs text-gray-500">Inclusive of all taxes</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column: Hotel Info & What's Next */}
            <div>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle className="text-foreground font-serif">Hotel Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <p className="font-bold text-base">SAHAJANAND WELLNESS</p>
                  <div className="flex items-start gap-3 text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      Street No.12, Shisham Jhadi, Muni Ki Reti, Near Ganga
                      Kinare, Rishikesh U.K Pin Code: 249201
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{property.phone}</span>
                  </div>
                  <div className="aspect-video w-full overflow-hidden rounded-lg border mt-4">
                    <iframe
                      src={property.google_maps_url}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen={false}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
                </CardContent>
                <Separator className="my-4" />
                <CardHeader className="pt-0">
                  <CardTitle className="text-foreground font-serif">What&apos;s Next?</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground pt-0">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>
                      A confirmation email has been sent to{" "}
                      <strong className="text-foreground">
                        {guest?.email}
                      </strong>
                      .
                    </span>
                  </div>
                  <p>
                    Please contact us for any special requests or questions
                    about your stay.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button asChild size="lg" className="h-12 px-10 rounded-lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}