import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppChrome } from "@/components/AppChrome";
import { SeniorOnboardingGuard } from "@/components/SeniorOnboardingGuard";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "NIAT Q&A — Ask seniors, get answers",
  description: "Prospective students ask questions. Verified NIAT seniors answer.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <Providers>
          <SeniorOnboardingGuard>
            <AppChrome>{children}</AppChrome>
          </SeniorOnboardingGuard>
        </Providers>
      </body>
    </html>
  );
}
