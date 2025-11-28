import { z } from "zod";

export const donationFormSchema = z.object({
  donorName: z.string().min(2, "Please enter your full name."),
  email: z.string().email("Enter a valid email."),
  phone: z
    .string()
    .regex(/^[0-9+\-() ]{8,20}$/i, "Enter a valid phone number."),
  amount: z
    .number({ invalid_type_error: "Enter a donation amount." })
    .min(100, "Minimum donation is ₹100."),
  currency: z.string().min(1),
  frequency: z.enum(["one_time", "monthly"], {
    required_error: "Select a frequency.",
  }),
  message: z.string().max(500).optional().or(z.literal("")),
  consent: z
    .boolean()
    .refine((value) => value === true, { message: "Please accept the consent statement." }),
  allowUpdates: z.boolean().optional(),
});

export type DonationFormValues = z.infer<typeof donationFormSchema>;
