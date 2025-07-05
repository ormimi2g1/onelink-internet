import type { Metadata } from "next";
import ClientLayout from "@/components/ClientLayout";
import "./globals.css";

export const metadata: Metadata = {
  title: "One Link Internet - Fast & Reliable Internet Service Across Nigeria",
  description: "Experience lightning-fast internet with One Link Internet. Get unlimited high-speed broadband with 24/7 support across Lagos, Abuja, Port Harcourt & Ilorin.",
  keywords: "internet service provider, broadband, nigeria, fiber optic, high speed internet, lagos, abuja, port harcourt, ilorin",
  authors: [{ name: "One Link Internet" }],
  openGraph: {
    title: "One Link Internet - Fast & Reliable Internet Service Across Nigeria",
    description: "Experience lightning-fast internet with One Link Internet. Get unlimited high-speed broadband with 24/7 support.",
    type: "website",
    locale: "en_NG",
    siteName: "One Link Internet"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ClientLayout>
          {children}
        </ClientLayout>
      </body>
    </html>
  );
}
