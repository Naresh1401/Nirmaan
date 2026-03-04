import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Nirmaan — Construction Materials Marketplace",
  description:
    "Digital infrastructure for construction material supply. Compare prices, order materials, and get reliable delivery.",
  keywords: [
    "construction materials",
    "building materials",
    "cement",
    "sand",
    "steel",
    "bricks",
    "construction supply",
    "Peddapalli",
    "Telangana",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
