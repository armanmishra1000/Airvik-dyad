"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

/**
 * Renders a "Forgot password" form and handles sending a password reset email.
 *
 * On submit, requests a reset link via Supabase, shows a success or error toast,
 * and resets the form when the request succeeds.
 *
 * @returns A React element containing the forgot-password form UI.
 */
export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(values.email);

    if (error) {
      toast.error("Unable to send reset link", {
        description: error.message,
      });
    } else {
      toast.success("Check your inbox", {
        description:
          "We’ve sent a reset link to your email. Follow the instructions to choose a new password.",
      });
      form.reset();
    }

    setIsLoading(false);
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="font-serif text-3xl text-foreground">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter the email connected to your account and we’ll send you a link to
          create a new password.
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="hotelowner@gmail.com"
                    {...field}
                    type="email"
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="h-12 w-full"
            disabled={isLoading}
            aria-busy={isLoading}
          >
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
      <p className="text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link
          href="/login"
          className="font-medium text-primary underline underline-offset-4"
        >
          Return to sign in
        </Link>
      </p>
    </div>
  );
}