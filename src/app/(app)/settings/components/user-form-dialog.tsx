"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { User } from "@/data/types";
import { useAppContext } from "@/context/app-context";
import { supabase } from "@/integrations/supabase/client";

const userSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
  roleId: z.string({ required_error: "Please select a role." }),
});

const editUserSchema = userSchema.omit({ password: true }).extend({
    password: z.string().optional(),
});

type UserFormValues = z.infer<typeof editUserSchema>;

interface UserFormDialogProps {
  user?: User;
  children: React.ReactNode;
}

export function UserFormDialog({
  user,
  children,
}: UserFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const { roles, updateUser } = useAppContext();
  const isEditing = !!user;

  const form = useForm<UserFormValues>({
    resolver: zodResolver(isEditing ? editUserSchema : userSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      password: "",
      roleId: user?.roleId || "",
    },
  });

  async function onSubmit(values: UserFormValues) {
    if (isEditing && user) {
      // Update user logic (e.g., role change)
      updateUser(user.id, { name: values.name, roleId: values.roleId });
      toast.success("User updated successfully!");
    } else {
      // Create user logic using Edge Function
      const selectedRole = roles.find(r => r.id === values.roleId);
      const { error } = await supabase.functions.invoke('create-user', {
        body: {
          email: values.email,
          password: values.password,
          name: values.name,
          role_name: selectedRole?.name,
        },
      });

      if (error) {
        toast.error("Failed to create user", { description: error.message });
      } else {
        toast.success("User created successfully!");
        form.reset();
        setOpen(false);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit User" : "Add New User"}
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the user.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" {...field} type="email" disabled={isEditing} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!isEditing && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="••••••••" {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="roleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.id} value={role.id}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit">
                {isEditing ? "Save Changes" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}