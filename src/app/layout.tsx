import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DosimetryProvider } from "./contexts/DosimetryProvider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { Header } from "@/components/layout/Header"; // Importe o Header

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Calculadora de Dosimetria",
  description:
    "Uma ferramenta para calcular a dosimetria da pena de forma fácil e intuitiva.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Calculadora de Dosimetria da Pena",
    description:
      "Calcule a pena de forma fácil e intuitiva com esta ferramenta moderna.",
    url: "https://dosemetria.pages.dev",
    siteName: "Calculadora de Dosimetria",
    images: [
      {
        url: "/justica.png",
        width: 512,
        height: 512,
        alt: "Visualização da Calculadora de Dosimetria da Pena",
      },
    ],
    locale: "pt_BR",
    type: "website",
  },
};
// -----------------------------------------------------------

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <DosimetryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <Header /> {/* Adicione o Header aqui */}
            {children}
          </ThemeProvider>
          <Toaster position="top-center" expand={true} richColors />
        </DosimetryProvider>
      </body>
    </html>
  );
}
