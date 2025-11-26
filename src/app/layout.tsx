import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.scss";
import Navbar from "../components/Navbar"; 
import { Analytics } from "@vercel/analytics/react"; // <--- ADDED THIS IMPORT

const inter = Inter({ subsets: ["latin"] });
// We use JetBrains Mono for that "Coder" vibe in headers/tags
const mono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: "PromptVault",
  description: "The Marketplace for Prompt Engineers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} ${mono.variable}`}>
        {/* The Navbar sits at the top of every page */}
        <Navbar />
        
        {/* This creates space so content isn't hidden behind the fixed Navbar */}
        <div style={{ paddingTop: '70px' }}>
          {children}
        </div>

        {/* This is the invisible tracker for Vercel */}
        <Analytics /> 
      </body>
    </html>
  );
}