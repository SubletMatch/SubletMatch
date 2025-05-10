import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LeaseLink - Find Your Perfect Sublet",
  description:
    "LeaseLink is the premier platform for finding and listing sublets. Connect with verified property owners and tenants for safe, secure, and convenient subletting experiences.",
  keywords:
    "sublet, sublease, apartment, housing, rental, temporary housing, student housing, summer sublet, furnished apartment",
  authors: [{ name: "LeaseLink Team" }],
  creator: "LeaseLink",
  publisher: "LeaseLink",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://leaselink.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "LeaseLink - Find Your Perfect Sublet",
    description:
      "Connect with verified property owners and tenants for safe, secure, and convenient subletting experiences.",
    url: "https://leaselink.com",
    siteName: "LeaseLink",
    images: [
      {
        url: "/LandingPage_Atm.webp",
        width: 800,
        height: 500,
        alt: "LeaseLink - Modern apartment living",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LeaseLink - Find Your Perfect Sublet",
    description:
      "Connect with verified property owners and tenants for safe, secure, and convenient subletting experiences.",
    images: ["/LandingPage_Atm.webp"],
    creator: "@leaselink",
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
  verification: {
    google: "your-google-site-verification",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* ✅ Load Inter font from Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
