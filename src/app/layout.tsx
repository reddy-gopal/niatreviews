import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/Navbar";
import { MainLayout } from "@/components/MainLayout";

export const metadata: Metadata = {
  title: "NIATReviews — Community",
  description: "Community portal for prospective students",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <MainLayout>{children}</MainLayout>
          </div>
        </Providers>
      </body>
    </html>
  );
}
