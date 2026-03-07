import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider } from "@/context/AuthContext";
import ChatBot from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "Nirmaan — India's #1 Construction Materials Marketplace",
  description:
    "Buy construction materials online at best prices. Compare suppliers, get business credit, AI estimation, and reliable delivery. Cement, Steel, Sand, Bricks & more.",
  icons: {
    icon: '/favicon.svg',
    apple: '/logo-icon.svg',
  },
  keywords: [
    "construction materials",
    "building materials",
    "cement online",
    "steel bars",
    "sand delivery",
    "bricks",
    "construction supply chain",
    "business credit",
    "Hyderabad",
    "Telangana",
    "India",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans">
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <ChatBot />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
