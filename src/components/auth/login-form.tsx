"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
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
import { getUserProfile } from "@/lib/api";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormProps = {
  redirectTo?: string;
  forgotPasswordHref?: string;
  allowedRoleNames?: string[];
};

interface UserMetadataWithRole {
  role_name?: string;
}

interface ProfileWithRoles {
  roles?: {
    name?: string | null;
  } | null;
}

export function LoginForm({ redirectTo = "/dashboard", forgotPasswordHref = "/forgot-password", allowedRoleNames }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      toast.error("Login failed", {
        description: error.message,
      });
    } else {
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
        } catch {
          // ignore
        }
      }

      if (allowedRoleNames && roleName && !allowedRoleNames.includes(roleName)) {
        await supabase.auth.signOut();
        toast.error("You cannot sign in here.", {
          description: "Use the appropriate portal for your role.",
        });
      } else {
        toast.success("Login successful!", {
          description: "Redirecting...",
        });
        router.push(redirectTo);
      }
    }
    setIsLoading(false);
  }

  const newLocal = "mx-auto flex w-full max-w-sm min-h-screen flex-col justify-center px-4 py-16 sm:max-w-md";
  return (
    <div className={newLocal}>
      <Card className="w-full shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-serif text-foreground">
            Sign in
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Access the ashram dashboard using your registered credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="••••••••"
                        {...field}
                        type="password"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <div className="mt-2 text-right">
                      <Link
                        href={forgotPasswordHref}
                        className="text-sm font-medium text-primary underline underline-offset-4"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-11 w-full"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
