import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
  title: "Tutor Hub | Personalised tutoring that fits",
  description: "Match with a verified specialist tutor, book flexible sessions, and follow every small learning win in one connected space.",
  keywords: "personalised tutoring, specialist tutors, learning support, tutor matching, child learning, online tutoring",
  authors: [{ name: "Tutor Hub" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
