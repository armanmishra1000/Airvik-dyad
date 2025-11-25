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
import { ShieldCheck, CalendarCheck, LineChart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/lib/api";
import { ADMIN_ROLES } from "@/constants/roles";

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

export function AdminLoginForm() {
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

    const isAdminRole = ADMIN_ROLES.some((adminRole) => adminRole === roleName);

    if (!roleName || !isAdminRole) {
      await supabase.auth.signOut();
      toast.error("Admins only", { description: "Use the guest portal at /login." });
      setIsLoading(false);
      return;
    }

    toast.success("Welcome back", { description: "Redirecting to Admin..." });
    router.push("/admin");
    setIsLoading(false);
  }

  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,560px)] overflow-hidden">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-orange-400/30 to-rose-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/30 blur-3xl" />
      </div>

      {/* Brand / Visual side */}
      <div className="relative hidden md:flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/10 p-10">
        <div className="relative z-10 max-w-lg mx-auto text-left">
          <span className="inline-flex items-center rounded-full bg-white/70 dark:bg-white/10 px-3 py-1 text-xs ring-1 ring-black/5 dark:ring-white/10 mb-5">Admin</span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600">
            Streamlined hotel management
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">
            Sign in to manage reservations, housekeeping, rates, reports and more.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-orange-600" /> Role-based access</li>
            <li className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-orange-600" /> Smart scheduling</li>
            <li className="flex items-center gap-2"><LineChart className="h-4 w-4 text-orange-600" /> Insights & reporting</li>
          </ul>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_20%_20%,#000_2px,transparent_2px)] bg-[length:20px_20px]" />
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center p-6 sm:p-10 md:pr-12">
        <Card className="w-full max-w-lg rounded-2xl shadow-2xl backdrop-blur-md bg-white/80 dark:bg-neutral-900/60 ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="text-left pb-2">
            <CardTitle className="text-3xl font-serif">Admin Sign in</CardTitle>
            <CardDescription>Access the hotel operations dashboard.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input className="h-11" placeholder="admin@hotel.com" {...field} type="email" autoComplete="email" />
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
                        <Input className="h-11" placeholder="••••••••" {...field} type="password" autoComplete="current-password" />
                      </FormControl>
                      <div className="mt-2 text-right">
                        <Link href="/admin/forget-password" className="text-sm font-medium text-primary underline underline-offset-4">
                          Forgot password?
                        </Link>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="h-11 w-full bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20" disabled={isLoading}>
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
