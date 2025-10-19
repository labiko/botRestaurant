import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/Navigation/TopNavbar";
import Sidebar from "@/components/Navigation/Sidebar";
import Breadcrumbs from "@/components/Navigation/Breadcrumbs";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { EnvironmentProvider } from "@/contexts/EnvironmentContext";
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
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Menu AI Admin",
  },
  icons: {
    icon: [
      { url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/pwa-icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/pwa-icon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
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
          <RestaurantProvider>
            <EnvironmentProvider>
              <AuthGuard>
                {children}
              </AuthGuard>
            </EnvironmentProvider>
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
