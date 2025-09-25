import { Button } from "@/components/ui/button";
import { MadeWithDyad } from "@/components/made-with-dyad";
import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[1fr_auto] items-center justify-items-center min-h-screen p-8 text-center">
      <main className="flex flex-col gap-4 items-center">
        <h1 className="text-4xl font-bold">Hotel PMS</h1>
        <p className="text-muted-foreground max-w-md">
          Welcome to the Property Management System. Please login to continue.
        </p>
        <Button asChild size="lg" className="mt-4">
          <Link href="/login">Go to Login</Link>
        </Button>
      </main>
      <MadeWithDyad />
    </div>
  );
}