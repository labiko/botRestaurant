import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import TopNavbar from "@/components/Navigation/TopNavbar";
import Sidebar from "@/components/Navigation/Sidebar";
import Breadcrumbs from "@/components/Navigation/Breadcrumbs";
import { RestaurantProvider } from "@/contexts/RestaurantContext";
import { AuthProvider } from "@/lib/auth-context";

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
          <RestaurantProvider>
            {/* Navigation moderne ajoutée */}
            <TopNavbar />

            <div className="flex min-h-screen">
              {/* Sidebar moderne - visible sur toutes les tailles */}
              <Sidebar />

              {/* Contenu principal avec breadcrumbs */}
              <main className="flex-1 flex flex-col">
                <Breadcrumbs />

                {/* Zone de contenu existant - AUCUNE MODIFICATION */}
                <div className="flex-1 p-3 md:p-6">
                  {children}
                </div>
              </main>
            </div>
          </RestaurantProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
