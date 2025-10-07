import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { DataProvider } from "@/context/data-context";
import { StickyBookingButton } from "@/components/sticky-booking-button";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sahajanand Ashram | Rishikesh",
  description: "A spiritual ashram in Rishikesh dedicated to religious, educational, and health-related activities. Experience tranquility and spiritual rejuvenation.",
};

/**
 * Root layout component that provides global theming, authentication, and data contexts and renders page content with shared UI chrome.
 *
 * @param children - The page content to render within the application's global providers.
 * @returns The root HTML element containing the application providers, rendered children, the sticky booking button, and the toast container.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <AuthProvider>
            <DataProvider>
              {children}
              <StickyBookingButton />
              <Toaster />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}