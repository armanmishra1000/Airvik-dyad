"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({ email: z.string().email({ message: "Please enter a valid email address." }) });

export function AdminForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { email: "" } });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/resetpassword?from=admin` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, redirectTo ? { redirectTo } : undefined);
      if (error) {
        toast.error("Unable to send reset link", { description: error.message });
      } else {
        toast.success("Check your inbox", { description: "We’ve sent a reset link to your email." });
        form.reset();
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,560px)] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-orange-400/30 to-rose-400/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-400/30 blur-3xl" />
      </div>
      <div className="relative hidden md:flex items-center justify-center overflow-hidden bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-rose-950/10 p-10">
        <div className="relative z-10 max-w-lg mx-auto text-left">
          <span className="inline-flex items-center rounded-full bg-white/70 dark:bg-white/10 px-3 py-1 text-xs ring-1 ring-black/5 dark:ring-white/10 mb-5">Admin</span>
          <h2 className="text-4xl md:text-5xl font-serif font-semibold leading-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600">Reset admin access</h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md">We’ll email you a secure link to choose a new password.</p>
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.05] bg-[radial-gradient(circle_at_20%_20%,#000_2px,transparent_2px)] bg-[length:20px_20px]" />
      </div>
      <div className="flex items-center justify-center p-6 sm:p-10 md:pr-12">
        <Card className="w-full max-w-lg rounded-2xl shadow-2xl backdrop-blur-md bg-white/80 dark:bg-neutral-900/60 ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader className="text-left pb-2">
            <CardTitle className="text-3xl font-serif">Admin password reset</CardTitle>
            <CardDescription>Enter your admin email to receive a reset link.</CardDescription>
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
                        <Input placeholder="admin@hotel.com" {...field} type="email" autoComplete="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="h-11 w-full bg-orange-500 hover:bg-orange-600 text-white" disabled={isLoading} aria-busy={isLoading}>
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                      Sending instructions
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </Button>
              </form>
            </Form>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Remembered? <Link href="/admin/login" className="font-medium text-primary underline underline-offset-4">Return to sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
