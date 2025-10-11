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

export function UserForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);
  const form = useForm<z.infer<typeof formSchema>>({ resolver: zodResolver(formSchema), defaultValues: { email: "" } });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/resetpassword` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, redirectTo ? { redirectTo } : undefined);
    if (error) {
      toast.error("Unable to send reset link", { description: error.message });
    } else {
      toast.success("Check your inbox", { description: "We’ve sent a reset link to your email." });
      form.reset();
    }
    setIsLoading(false);
  }

  return (
    <div className="min-h-screen bg-muted grid place-items-center p-6">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-serif">Forgot password</CardTitle>
          <CardDescription>Enter your email to receive a reset link.</CardDescription>
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
              <Button type="submit" className="h-11 w-full" disabled={isLoading} aria-busy={isLoading}>
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
            Remembered? <Link href="/login" className="font-medium text-primary underline underline-offset-4">Return to sign in</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
