import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { HydrationFix } from "@/components/hydration-fix";
import { ErrorBoundary, HydrationErrorBoundary } from "@/components/error-boundary";
import { ErrorHandler } from "@/components/error-handler";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Salesforce",
  description: "Comprehensive business management solution for customer relationship and enterprise resource management",
  keywords: ["CRM", "ERP", "Business Management", "Sales", "Inventory", "Customer Relationship", "Enterprise Software"],
  authors: [{ name: "Salesforce Team" }],
  viewport: "width=device-width, initial-scale=1",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/logo-square.svg",
  },
  openGraph: {
    title: "Salesforce",
    description: "Comprehensive business management solution",
    images: ["/logo.svg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head suppressHydrationWarning>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {process.env.NODE_ENV === 'development' && (
          <meta httpEquiv="Content-Security-Policy" content="frame-src 'self' https://vercel.live;" />
        )}
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <ErrorHandler />
        <HydrationFix />
        <ErrorBoundary>
          <HydrationErrorBoundary>
            <QueryProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </QueryProvider>
          </HydrationErrorBoundary>
        </ErrorBoundary>
      </body>
    </html>
  );
}
