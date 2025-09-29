export const iconList = [
  "Wifi", "AirVent", "Tv", "Refrigerator", "Waves", "GalleryVertical", "Bath", "GlassWater",
  "ParkingCircle", "Utensils", "Dumbbell", "SwimmingPool", "Coffee", "Wind", "Sun", "Mountain",
  "Dog", "Cat", "Bone", "PawPrint", "Car", "Plane", "Ship", "Train", "Bus", "Bike", "Walk",
  "Accessibility", "Baby", "Bed", "BedDouble", "BedSingle", "ShowerHead", "Speaker", "Fan",
  "Microwave", "ConciergeBell", "Luggage", "Key", "DoorOpen", "CigaretteOff", "Flower", "Sprout",
  "Check", "X", "Info", "Star", "Heart", "Award", "Trophy", "Gift", "Wallet", "CreditCard",
  "Armchair", "WashingMachine", "CookingPot", "Building", "TicketPercent"
] as const;

export type IconName = typeof iconList[number];



