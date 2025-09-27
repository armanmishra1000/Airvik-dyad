import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <h1 className="text-2xl font-bold mb-4">Forgot Password</h1>
      <p className="mb-8 text-muted-foreground">
        This feature is not yet implemented.
      </p>
      <Button asChild>
        <Link href="/login">Back to Login</Link>
      </Button>
    </div>
  );
}