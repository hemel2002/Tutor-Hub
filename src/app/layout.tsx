import type { Metadata } from "next";
import { Outfit, Caveat } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "James Stanfield Tutor Hub - Specialized Learning Marketplace",
  description: "The most trusted educational hub for parents, students, and educators. Featuring specialized social skills learning, AI matching, last-minute QuickBookings, and performance snapshots.",
  keywords: "tutoring, social skills, video modeling, educational marketplace, AI matching, child learning, test prep",
  authors: [{ name: "James Stanfield Company" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable} ${caveat.variable}`}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

