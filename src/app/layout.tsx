import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/lib/query/provider";
import { SessionProviderWrapper } from "@/components/providers/session-provider";
import { MainNav } from "@/components/navigation/main-nav";
import { Toaster } from "sonner";
import { env } from "@/lib/env";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: env.NEXT_PUBLIC_APP_NAME,
    template: `%s | ${env.NEXT_PUBLIC_APP_NAME}`,
  },
  description: "Fox Club - Plateforme de gestion de formulaires et préférences",
  keywords: ["Fox Club", "Formulaires", "Gestion utilisateurs"],
  authors: [{ name: "Fox Club" }],
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: env.NEXT_PUBLIC_APP_URL,
    siteName: env.NEXT_PUBLIC_APP_NAME,
    title: env.NEXT_PUBLIC_APP_NAME,
    description: "Plateforme de gestion de formulaires et préférences",
  },
  twitter: {
    card: "summary_large_image",
    title: env.NEXT_PUBLIC_APP_NAME,
    description: "Plateforme de gestion de formulaires et préférences",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <QueryProvider>
            <MainNav />
            <main className="min-h-screen bg-gray-50">{children}</main>
            <Toaster position="top-right" richColors />
          </QueryProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
