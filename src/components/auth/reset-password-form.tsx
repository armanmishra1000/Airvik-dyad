"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z
  .object({
    password: z.string().min(6, { message: "Min 6 characters." }),
    confirmPassword: z.string().min(6, { message: "Confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [ready, setReady] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  React.useEffect(() => {
    async function ensureSession() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        setReady(true);
        return;
      }
      const hash = typeof window !== "undefined" ? window.location.hash : "";
      if (hash) {
        try {
          const { error } = await supabase.auth.exchangeCodeForSession(hash);
          if (error) {
            console.error(error);
            toast.error("Invalid or expired reset link");
          } else {
            setReady(true);
          }
        } catch (e) {
          console.error(e);
          toast.error("Unable to process reset link");
        }
      }
    }
    ensureSession();
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password: values.password });
    if (error) {
      toast.error("Failed to update password", { description: error.message });
    } else {
      toast.success("Password updated. Please sign in.");
      router.push("/login");
    }
    setIsLoading(false);
  }

  return (
    <div className="mx-auto flex w-full max-w-sm min-h-screen flex-col justify-center px-4 py-16 sm:max-w-md">
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif text-foreground">Reset password</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Choose a new password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!ready ? (
            <p className="text-sm text-muted-foreground">Validating reset link...</p>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm password</FormLabel>
                      <FormControl>
                        <Input type="password" autoComplete="new-password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="h-11 w-full" disabled={isLoading}>
                  {isLoading ? "Updating..." : "Update password"}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
