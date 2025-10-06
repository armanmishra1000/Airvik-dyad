import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/auth-context";
import { DataProvider } from "@/context/data-context";

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
 * Renders the application's root HTML structure and wraps page content with global providers and layout essentials.
 *
 * Wraps `children` with ThemeProvider, AuthProvider, and DataProvider, injects global fonts and body classes, and includes the Toaster.
 *
 * @param children - The page or application content to render inside the root layout
 * @returns The root `<html>`/`<body>` structure that hosts global providers and the rendered `children`
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
              <Toaster />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}