import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#00769F",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://fluentai-english.vercel.app"),
  title: {
    default: "FluentAI - Your AI Powered English Learning Partner",
    template: "%s | FluentAI",
  },
  description:
    "Master English speaking, grammar, and academic vocabulary with our interactive AI mentor. Get instant feedback, IELTS practice, and natural conversation partner anytime.",
  keywords: [
    "AI English Teacher",
    "Learn English",
    "IELTS Speaking Practice",
    "English Tutor AI",
    "Grammar Coach",
    "Vocabulary Builder",
    "Interactive Conversation",
    "Spoken English App",
  ],
  authors: [{ name: "FluentAI Team" }],
  creator: "FluentAI",
  publisher: "FluentAI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "FluentAI - Your AI Powered English Learning Partner",
    description:
      "Boost your English fluency with personal AI tutors, real-time corrections, and interactive learning modules.",
    url: "https://fluentai-english.vercel.app",
    siteName: "FluentAI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "FluentAI - Your AI English Partner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FluentAI - AI Powered English Learning",
    description:
      "Master spoken English & grammar with your personalized AI tutor duo.",
    creator: "@fluentai",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://fluentai-english.vercel.app",
  },
};

import AppProviders from "@/components/providers/AppProviders";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD Structured Data for EducationalApplication & Course
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "FluentAI English Learning Platform",
    "operatingSystem": "Web",
    "applicationCategory": "EducationalApplication",
    "description": "AI-powered English tutor platform offering grammar coaching, vocabulary building, and speech feedback.",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "1250"
    }
  };

  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full bg-[var(--primary-bg)] text-[var(--text-heading)] selection:bg-[var(--primary-soft)] selection:text-[var(--primary)] flex flex-col font-sans">
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
