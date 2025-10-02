// "use client";
// import * as React from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import * as z from "zod";
// import {
//   format,
//   parse,
//   differenceInDays,
//   areIntervalsOverlapping,
//   parseISO,
// } from "date-fns";
// import { toast } from "sonner";
// import Image from "next/image";
// import { ThumbsUp, ParkingCircle, Loader2 } from "lucide-react";

// import { useDataContext } from "@/context/data-context";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Separator } from "@/components/ui/separator";
// import { Input } from "@/components/ui/input";
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from "@/components/ui/form";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import type { RoomType } from "@/data/types";

// const paymentSchema = z.object({
//   cardName: z.string().min(1, "Name on card is required."),
//   cardNumber: z
//     .string()
//     .min(16, "Card number must be 16 digits.")
//     .max(16, "Card number must be 16 digits."),
//   expiryDate: z
//     .string()
//     .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)."),
//   cvc: z.string().min(3, "CVC must be 3 digits.").max(4, "CVC is too long."),
//   firstName: z.string().min(1, "First name is required."),
//   lastName: z.string().min(1, "Last name is required."),
//   email: z.string().email("Please enter a valid email."),
//   country: z.string({ required_error: "Country is required." }),
//   phone: z.string().min(1, "Phone number is required."),
// });

// function BookingReviewContent() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const {
//     property,
//     roomTypes,
//     rooms,
//     reservations,
//     addGuest,
//     addReservation,
//     ratePlans,
//   } = useDataContext();

//   const [isProcessing, setIsProcessing] = React.useState(false);

//   const bookingDetails = React.useMemo(() => {
//     return {
//       roomTypeIds: searchParams.getAll("roomTypeId"),
//       from: searchParams.get("from"),
//       to: searchParams.get("to"),
//       guests: searchParams.get("guests"),
//       rooms: searchParams.get("rooms"),
//     };
//   }, [searchParams]);

//   const selectedRoomTypes = React.useMemo(() => {
//     if (!bookingDetails.roomTypeIds) return [];
//     return bookingDetails.roomTypeIds
//       .map((id) => roomTypes.find((rt) => rt.id === id))
//       .filter(Boolean) as RoomType[];
//   }, [bookingDetails.roomTypeIds, roomTypes]);

//   const ratePlan =
//     ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

//   const form = useForm<z.infer<typeof paymentSchema>>({
//     resolver: zodResolver(paymentSchema),
//     defaultValues: {
//       cardName: "",
//       cardNumber: "",
//       expiryDate: "",
//       cvc: "",
//       firstName: "",
//       lastName: "",
//       email: "",
//       country: "India",
//       phone: "",
//     },
//   });

//   const isLoading = roomTypes.length === 0 || !ratePlan;

//   if (isLoading) {
//     return (
//       <div className="flex items-center justify-center min-h-[60vh]">
//         <Loader2 className="h-12 w-12 animate-spin text-primary" />
//       </div>
//     );
//   }

//   if (
//     selectedRoomTypes.length === 0 ||
//     !bookingDetails.from ||
//     !bookingDetails.to
//   ) {
//     return (
//       <div className="container mx-auto px-4 py-10 text-center">
//         <h1 className="text-2xl font-bold">Invalid Booking Details</h1>
//         <p className="text-muted-foreground">
//           Something went wrong. Please start your search again.
//         </p>
//         <Button onClick={() => router.push("/")} className="mt-4">
//           Back to Home
//         </Button>
//       </div>
//     );
//   }

//   const fromDate = parse(bookingDetails.from, "yyyy-MM-dd", new Date());
//   const toDate = parse(bookingDetails.to, "yyyy-MM-dd", new Date());
//   const nights = differenceInDays(toDate, fromDate);
//   const totalCost = selectedRoomTypes.length * nights * (ratePlan?.price || 0);
//   const firstRoomType = selectedRoomTypes[0];

//   async function onSubmit(values: z.infer<typeof paymentSchema>) {
//     setIsProcessing(true);
//     try {
//       // Simulate network delay
//       await new Promise((resolve) => setTimeout(resolve, 1000));

//       // Find available physical rooms for the selection
//       const assignedRoomIds: string[] = [];
//       let allRoomsFound = true;

//       for (const roomType of selectedRoomTypes) {
//         const roomsOfType = rooms.filter((r) => r.roomTypeId === roomType.id);
//         const availableRoom = roomsOfType.find((room) => {
//           // Check if this physical room is already assigned in this booking
//           if (assignedRoomIds.includes(room.id)) return false;

//           // Check if this physical room has conflicting reservations
//           return !reservations.some(
//             (res) =>
//               res.roomId === room.id &&
//               res.status !== "Cancelled" &&
//               areIntervalsOverlapping(
//                 { start: fromDate, end: toDate },
//                 {
//                   start: parseISO(res.checkInDate),
//                   end: parseISO(res.checkOutDate),
//                 }
//               )
//           );
//         });

//         if (availableRoom) {
//           assignedRoomIds.push(availableRoom.id);
//         } else {
//           allRoomsFound = false;
//           break;
//         }
//       }

//       if (!allRoomsFound) {
//         toast.error("One or more rooms are no longer available", {
//           description:
//             "Sorry, some rooms sold out for your selected dates while you were booking.",
//         });
//         setIsProcessing(false);
//         return;
//       }

//       const newGuest = await addGuest({
//         firstName: values.firstName,
//         lastName: values.lastName,
//         email: values.email,
//         phone: values.phone,
//       });

//       const newReservations = await addReservation({
//         guestId: newGuest.id,
//         roomIds: assignedRoomIds,
//         ratePlanId: ratePlan.id,
//         checkInDate: bookingDetails.from!,
//         checkOutDate: bookingDetails.to!,
//         numberOfGuests: Number(bookingDetails.guests),
//         status: "Confirmed",
//         notes: "Booked via public website.",
//         bookingDate: new Date().toISOString(),
//         source: "website",
//       });

//       // Redirect to the confirmation page of the first reservation in the group
//       router.push(`/book/confirmation/${newReservations[0].id}`);
//     } catch (error: any) {
//       console.error("Booking failed:", error);
//       toast.error("Booking Failed", {
//         description:
//           error.message ||
//           "An unexpected error occurred. Please try again or contact support.",
//       });
//       setIsProcessing(false);
//     }
//   }

//   return (
//     <div className="container px-4 mx-auto py-10">
//       <h1 className="lg:text-3xl sm:text-2xl text-lg font-bold font-serif mb-6 text-center">
//         Review Your Booking
//       </h1>
//       <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
//         {/* Booking Summary - Right Side */}
//         <div className="space-y-6">
//           <Card>
//             <CardContent className="p-0">
//               <div className="relative h-56 w-full">
//                 <Image
//                   src={
//                     firstRoomType?.mainPhotoUrl ||
//                     firstRoomType?.photos?.[0] ||
//                     "/room-placeholder.svg"
//                   }
//                   alt={firstRoomType?.name || property.name}
//                   fill
//                   className="object-cover rounded-t-lg"
//                 />
//               </div>
//               <div className="p-4 space-y-2">
//                 <div className="flex items-center gap-2">
//                   <div className="bg-yellow-400 p-1 rounded-sm">
//                     <ThumbsUp className="h-4 w-4 text-white" />
//                   </div>
//                   <h3 className="text-lg font-bold">SAHAJANAND WELLNESS</h3>
//                 </div>
//                 <p className="text-sm text-muted-foreground">
//                   Address: Gali No- 13, shisham jhadi, Chandreshwar Nagar,
//                   Rishikesh, Uttarakhand 249137
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl">Your booking details</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="flex justify-between space-x-4">
//                 <div>
//                   <p className="font-semibold">Check-in</p>
//                   <p className="text-base">
//                     {format(fromDate, "E, d MMM yyyy")}
//                   </p>
//                   <p className="text-sm text-muted-foreground">From 12:00</p>
//                 </div>
//                 <Separator orientation="vertical" className="h-auto" />
//                 <div>
//                   <p className="font-semibold">Check-out</p>
//                   <p className="text-base">{format(toDate, "E, d MMM yyyy")}</p>
//                   <p className="text-sm text-muted-foreground">Until 11:00</p>
//                 </div>
//               </div>
//               <div className="mt-4">
//                 <p className="font-semibold">Total length of stay:</p>
//                 <p className="text-lg">
//                   {nights} night{nights > 1 ? "s" : ""}
//                 </p>
//               </div>
//             </CardContent>
//           </Card>

//           <Card>
//             <CardHeader>
//               <CardTitle className="text-xl">Your total</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="text-sm">
//                 <p className="font-semibold mb-2">Price details</p>
//                 <div className="flex justify-between">
//                   <span className="text-muted-foreground">
//                     {nights} night{nights > 1 ? "s" : ""} x $
//                     {ratePlan?.price.toFixed(2)}
//                   </span>
//                   <span className="font-medium">
//                     ${(nights * (ratePlan?.price || 0)).toFixed(2)}
//                   </span>
//                 </div>
//                 <div className="flex justify-between mt-1">
//                   <span className="text-muted-foreground">Free</span>
//                   <span className="font-medium">$0</span>
//                 </div>
//               </div>
//               <Separator />
//               <div className="flex justify-between font-bold text-lg">
//                 <span>Total (INR)</span>
//                 <span>${totalCost.toFixed(2)}</span>
//               </div>
//             </CardContent>
//           </Card>
//         </div>

//         {/* Guest & Payment Information  - Left Side */}
//         <div className="md:col-span-2">
//           <Card>
//             <CardHeader>
//               <CardTitle>Guest & Payment Information</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <Form {...form}>
//                 <form
//                   onSubmit={form.handleSubmit(onSubmit)}
//                   className="space-y-6"
//                 >
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold">Guest Details</h3>
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="firstName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>First Name</FormLabel>
//                             <FormControl>
//                               <Input {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="lastName"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Last Name</FormLabel>
//                             <FormControl>
//                               <Input {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                     <FormField
//                       control={form.control}
//                       name="email"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Email</FormLabel>
//                           <FormControl>
//                             <Input type="email" {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />

//                     <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="country"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Country/region</FormLabel>
//                             <Select
//                               onValueChange={field.onChange}
//                               defaultValue={field.value}
//                             >
//                               <FormControl>
//                                 <SelectTrigger>
//                                   <SelectValue placeholder="Select your country" />
//                                 </SelectTrigger>
//                               </FormControl>
//                               <SelectContent>
//                                 <SelectItem value="India">India</SelectItem>
//                                 <SelectItem value="United States">
//                                   United States
//                                 </SelectItem>
//                                 <SelectItem value="United Kingdom">
//                                   United Kingdom
//                                 </SelectItem>
//                                 <SelectItem value="Canada">Canada</SelectItem>
//                               </SelectContent>
//                             </Select>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="phone"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Phone number</FormLabel>
//                             <div className="flex items-center gap-2">
//                               <Select defaultValue="IN +91">
//                                 <SelectTrigger className="w-[120px]">
//                                   <SelectValue placeholder="Code" />
//                                 </SelectTrigger>
//                                 <SelectContent>
//                                   <SelectItem value="IN +91">IN +91</SelectItem>
//                                   <SelectItem value="US +1">US +1</SelectItem>
//                                   <SelectItem value="UK +44">UK +44</SelectItem>
//                                   <SelectItem value="CA +1">CA +1</SelectItem>
//                                 </SelectContent>
//                               </Select>
//                               <FormControl>
//                                 <Input
//                                   type="tel"
//                                   placeholder="Your phone number"
//                                   {...field}
//                                 />
//                               </FormControl>
//                             </div>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                   <Separator />
//                   <div className="space-y-4">
//                     <h3 className="text-lg font-semibold">Payment Details</h3>
//                     <FormField
//                       control={form.control}
//                       name="cardName"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Name on Card</FormLabel>
//                           <FormControl>
//                             <Input {...field} />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <FormField
//                       control={form.control}
//                       name="cardNumber"
//                       render={({ field }) => (
//                         <FormItem>
//                           <FormLabel>Card Number</FormLabel>
//                           <FormControl>
//                             <Input
//                               placeholder="•••• •••• •••• ••••"
//                               {...field}
//                             />
//                           </FormControl>
//                           <FormMessage />
//                         </FormItem>
//                       )}
//                     />
//                     <div className="grid grid-cols-2 gap-4">
//                       <FormField
//                         control={form.control}
//                         name="expiryDate"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>Expiry Date</FormLabel>
//                             <FormControl>
//                               <Input placeholder="MM/YY" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                       <FormField
//                         control={form.control}
//                         name="cvc"
//                         render={({ field }) => (
//                           <FormItem>
//                             <FormLabel>CVC</FormLabel>
//                             <FormControl>
//                               <Input placeholder="•••" {...field} />
//                             </FormControl>
//                             <FormMessage />
//                           </FormItem>
//                         )}
//                       />
//                     </div>
//                   </div>
//                   <Button
//                     type="submit"
//                     className="w-full text-lg rounded-lg h-12"
//                     disabled={isProcessing}
//                   >
//                     {isProcessing
//                       ? "Processing..."
//                       : `Confirm & Pay $${totalCost.toFixed(2)}`}
//                   </Button>
//                 </form>
//               </Form>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function BookingReviewPage() {
//   return (
//     <React.Suspense
//       fallback={
//         <div className="flex items-center justify-center min-h-[60vh]">
//           <Loader2 className="h-12 w-12 animate-spin text-primary" />
//         </div>
//       }
//     >
//       <BookingReviewContent />
//     </React.Suspense>
//   );
// }


"use client";
import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  format,
  parse,
  differenceInDays,
  areIntervalsOverlapping,
  parseISO,
} from "date-fns";
import { toast } from "sonner";
import Image from "next/image";
import { ThumbsUp, ParkingCircle, Loader2 } from "lucide-react";

import { useDataContext } from "@/context/data-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RoomType } from "@/data/types";

const paymentSchema = z.object({
  cardName: z.string().min(1, "Name on card is required."),
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits.")
    .max(16, "Card number must be 16 digits."),
  expiryDate: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Invalid expiry date (MM/YY)."),
  cvc: z.string().min(3, "CVC must be 3 digits.").max(4, "CVC is too long."),
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  email: z.string().email("Please enter a valid email."),
  country: z.string({ required_error: "Country is required." }),
  phone: z.string().min(1, "Phone number is required."),
});

function BookingReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    property,
    roomTypes,
    rooms,
    reservations,
    addGuest,
    addReservation,
    ratePlans,
  } = useDataContext();

  const [isProcessing, setIsProcessing] = React.useState(false);

  const bookingDetails = React.useMemo(() => {
    return {
      roomTypeIds: searchParams.getAll("roomTypeId"),
      from: searchParams.get("from"),
      to: searchParams.get("to"),
      guests: searchParams.get("guests"),
      rooms: searchParams.get("rooms"),
    };
  }, [searchParams]);

  const selectedRoomTypes = React.useMemo(() => {
    if (!bookingDetails.roomTypeIds) return [];
    return bookingDetails.roomTypeIds
      .map((id) => roomTypes.find((rt) => rt.id === id))
      .filter(Boolean) as RoomType[];
  }, [bookingDetails.roomTypeIds, roomTypes]);

  const ratePlan =
    ratePlans.find((rp) => rp.name === "Standard Rate") || ratePlans[0];

  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardName: "",
      cardNumber: "",
      expiryDate: "",
      cvc: "",
      firstName: "",
      lastName: "",
      email: "",
      country: "India",
      phone: "",
    },
  });

  const isLoading = roomTypes.length === 0 || !ratePlan;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh] gap-2">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-primary text-xl">Loading...</p>
      </div>
    );
  }

  if (
    selectedRoomTypes.length === 0 ||
    !bookingDetails.from ||
    !bookingDetails.to
  ) {
    return (
      <div className="container mx-auto px-4 py-10 text-center">
        <h1 className="text-2xl font-bold">Invalid Booking Details</h1>
        <p className="text-muted-foreground">
          Something went wrong. Please start your search again.
        </p>
        <Button onClick={() => router.push("/")} className="mt-4">
          Back to Home
        </Button>
      </div>
    );
  }

  const fromDate = parse(bookingDetails.from, "yyyy-MM-dd", new Date());
  const toDate = parse(bookingDetails.to, "yyyy-MM-dd", new Date());
  const nights = differenceInDays(toDate, fromDate);
  const totalCost = selectedRoomTypes.length * nights * (ratePlan?.price || 0);
  const firstRoomType = selectedRoomTypes[0];

  async function onSubmit(values: z.infer<typeof paymentSchema>) {
    setIsProcessing(true);
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find available physical rooms for the selection
      const assignedRoomIds: string[] = [];
      let allRoomsFound = true;

      for (const roomType of selectedRoomTypes) {
        const roomsOfType = rooms.filter((r) => r.roomTypeId === roomType.id);
        const availableRoom = roomsOfType.find((room) => {
          // Check if this physical room is already assigned in this booking
          if (assignedRoomIds.includes(room.id)) return false;

          // Check if this physical room has conflicting reservations
          return !reservations.some(
            (res) =>
              res.roomId === room.id &&
              res.status !== "Cancelled" &&
              areIntervalsOverlapping(
                { start: fromDate, end: toDate },
                {
                  start: parseISO(res.checkInDate),
                  end: parseISO(res.checkOutDate),
                }
              )
          );
        });

        if (availableRoom) {
          assignedRoomIds.push(availableRoom.id);
        } else {
          allRoomsFound = false;
          break;
        }
      }

      if (!allRoomsFound) {
        toast.error("One or more rooms are no longer available", {
          description:
            "Sorry, some rooms sold out for your selected dates while you were booking.",
        });
        setIsProcessing(false);
        return;
      }

      const newGuest = await addGuest({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
      });

      const newReservations = await addReservation({
        guestId: newGuest.id,
        roomIds: assignedRoomIds,
        ratePlanId: ratePlan.id,
        checkInDate: bookingDetails.from!,
        checkOutDate: bookingDetails.to!,
        numberOfGuests: Number(bookingDetails.guests),
        status: "Confirmed",
        notes: "Booked via public website.",
        bookingDate: new Date().toISOString(),
        source: "website",
      });

      // Redirect to the confirmation page of the first reservation in the group
      router.push(`/book/confirmation/${newReservations[0].id}`);
    } catch (error: any) {
      console.error("Booking failed:", error);
      toast.error("Booking Failed", {
        description:
          error.message ||
          "An unexpected error occurred. Please try again or contact support.",
      });
      setIsProcessing(false);
    }
  }

  return (
    <div className="container px-4 mx-auto py-10">
      <h1 className="lg:text-3xl sm:text-2xl text-lg font-bold font-serif mb-6 text-center">
        Review Your Booking
      </h1>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Booking Summary - Right Side */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="relative h-52 w-full">
                {/* room image */}
                <Image
                  src={
                    firstRoomType?.mainPhotoUrl ||
                    firstRoomType?.photos?.[0] ||
                    "/room-placeholder.svg"
                  }
                  alt={firstRoomType?.name || property.name}
                  fill
                  className="object-cover rounded-t-lg"
                />
              </div>
              <div className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-primary p-1 rounded-md">
                    <ThumbsUp className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold">SAHAJANAND WELLNESS</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Address: Gali No- 13, shisham jhadi, Chandreshwar Nagar,
                  Rishikesh, Uttarakhand 249137
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your booking details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between space-x-4">
                <div>
                  <p className="font-semibold">Check-in</p>
                  <p className="text-base">
                    {format(fromDate, "E, d MMM yyyy")}
                  </p>
                  <p className="text-sm text-muted-foreground">From 12:00</p>
                </div>
                <Separator orientation="vertical" className="h-auto" />
                <div>
                  <p className="font-semibold">Check-out</p>
                  <p className="text-base">{format(toDate, "E, d MMM yyyy")}</p>
                  <p className="text-sm text-muted-foreground">Until 11:00</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-semibold">Total length of stay:</p>
                <p className="text-lg">
                  {nights} night{nights > 1 ? "s" : ""}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your total</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm">
                <p className="font-semibold mb-2">Price details</p>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    {nights} night{nights > 1 ? "s" : ""} x $
                    {ratePlan?.price.toFixed(2)}
                  </span>
                  <span className="font-medium">
                    ${(nights * (ratePlan?.price || 0)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-muted-foreground">Free</span>
                  <span className="font-medium">$0</span>
                </div>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total (INR)</span>
                <span>${totalCost.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Guest & Payment Information  - Left Side */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Guest & Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Guest Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country/region</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select your country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="India">India</SelectItem>
                                <SelectItem value="United States">
                                  United States
                                </SelectItem>
                                <SelectItem value="United Kingdom">
                                  United Kingdom
                                </SelectItem>
                                <SelectItem value="Canada">Canada</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone number</FormLabel>
                            <div className="flex items-center gap-2">
                              <Select defaultValue="IN +91">
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue placeholder="Code" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="IN +91">IN +91</SelectItem>
                                  <SelectItem value="US +1">US +1</SelectItem>
                                  <SelectItem value="UK +44">UK +44</SelectItem>
                                  <SelectItem value="CA +1">CA +1</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="Your phone number"
                                  {...field}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Details</h3>
                    <FormField
                      control={form.control}
                      name="cardName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name on Card</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="cardNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Card Number</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="•••• •••• •••• ••••"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="expiryDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Date</FormLabel>
                            <FormControl>
                              <Input placeholder="MM/YY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="cvc"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CVC</FormLabel>
                            <FormControl>
                              <Input placeholder="•••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-lg rounded-lg h-12"
                    disabled={isProcessing}
                  >
                    {isProcessing
                      ? "Processing..."
                      : `Confirm & Pay $${totalCost.toFixed(2)}`}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function BookingReviewPage() {
  return (
    <React.Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <BookingReviewContent />
    </React.Suspense>
  );
}


