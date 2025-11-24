"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/lib/api";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

interface UserMetadataWithRole {
  role_name?: string;
}

interface ProfileWithRoles {
  roles?: {
    name?: string | null;
  } | null;
}

export function UserLoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) {
      toast.error("Login failed", { description: error.message });
      setIsLoading(false);
      return;
    }

    let roleName: string | null = null;
    const user = data.user ?? (await supabase.auth.getUser()).data.user;
    const metaRole =
      (user?.user_metadata as UserMetadataWithRole | undefined)?.role_name ??
      null;
    roleName = typeof metaRole === "string" ? metaRole : null;
    if (!roleName && user?.id) {
      try {
        const { data: profile } = await getUserProfile(user.id);
        const profileRoles = (profile as ProfileWithRoles | null | undefined)
          ?.roles;
        const profileRoleName =
          profileRoles && typeof profileRoles.name === "string"
            ? profileRoles.name
            : null;
        roleName = profileRoleName ?? roleName;
      } catch {}
    }

    if (roleName && roleName !== "Guest") {
      await supabase.auth.signOut();
      toast.error("Guests only", { description: "Use the admin portal at /admin/login." });
      setIsLoading(false);
      return;
    }

    toast.success("Welcome", { description: "Redirecting to Profile..." });
    router.push("/profile");
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted grid place-items-center p-6">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Guest Sign in</CardTitle>
          <CardDescription>Access your bookings and profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="you@example.com" {...field} type="email" autoComplete="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" autoComplete="current-password" />
                    </FormControl>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <Link href="/forgot-password" className="font-medium text-primary underline underline-offset-4">Forgot password?</Link>
                      <Link href="/register" className="text-muted-foreground hover:underline">Create account</Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-11 w-full" disabled={isLoading} aria-busy={isLoading}>
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
