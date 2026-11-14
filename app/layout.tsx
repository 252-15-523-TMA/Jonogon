import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jonogon (জনগণ) | Bangladesh Civic Intelligence Platform",
  description: "Next-generation digital public infrastructure connecting citizens and government through AI-powered civic reporting, service intelligence, and administrative copilot.",
  keywords: ["Jonogon", "Bangladesh", "CivicSphere AI", "GovCopilot", "Citizen Services", "E-Governance", "CivicSignal"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" suppressHydrationWarning>
      <body className="antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
