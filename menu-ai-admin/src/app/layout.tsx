import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/Navigation/TopNavbar";
import Sidebar from "@/components/Navigation/Sidebar";
import Breadcrumbs from "@/components/Navigation/Breadcrumbs";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { AuthProvider } from "@/lib/auth-context";
import AuthGuard from "@/components/AuthGuard";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Menu AI Admin - Gestion Restaurants",
  description: "Interface d'administration intelligente pour la gestion des menus de restaurants",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <AuthProvider>
          <AuthGuard>
            {children}
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  );
}
