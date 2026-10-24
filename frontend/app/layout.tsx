import type { Metadata } from 'next';
import './globals.css';
import { Suspense } from 'react';
import { AuthProvider } from '../lib/auth';
import { CartProvider } from '../lib/cart';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';

export const metadata: Metadata = {
  metadataBase: new URL('https://ergocraft.in'),
  title: {
    default: 'ErgoCraft Seating Pvt. Ltd. | Premium Ergonomic Office Furniture & Luxury Sofas',
    template: '%s | ErgoCraft Seating',
  },
  description:
    'Direct from our Bhiwandi factory: Discover high-performance ergonomic office chairs, handcrafted luxury sofas, executive leatherette seating, and modern soft seating designed for elite workplaces and distinguished homes.',
  keywords: [
    'ergonomic office chairs',
    'executive chairs India',
    'handcrafted sofas Mumbai',
    'Bhiwandi furniture factory',
    'workstation chairs',
    'mesh office chairs',
    'soft seating',
    'lounge chairs',
    'commercial seating manufacturer',
    'Ergocraft Seating Pvt Ltd',
  ],
  authors: [{ name: 'ErgoCraft Seating Pvt. Ltd.' }],
  creator: 'ErgoCraft Seating Pvt. Ltd.',
  publisher: 'ErgoCraft Seating Pvt. Ltd.',
  formatDetection: {
    telephone: true,
    address: true,
    email: true,
  },
  openGraph: {
    title: 'ErgoCraft Seating Pvt. Ltd. | Precision Ergonomics & Handcrafted Luxury',
    description:
      'Engineered for 12+ hour postural support and manufactured in our Bhiwandi facility. Explore mesh office chairs, executive seating, handcrafted sofas, and soft breakout collections.',
    url: 'https://ergocraft.in',
    siteName: 'ErgoCraft Seating',
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ErgoCraft Seating Pvt. Ltd. | Factory Direct Seating Solutions',
    description:
      'Premium ergonomic seating and luxury sofas delivered across India. Direct factory pricing with 10-year warranty.',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/images/logo.png',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'Ergocraft Seating Pvt. Ltd.',
  image: 'https://ergocraft.in/images/logo.png',
  telephone: '+919768001999',
  email: 'support@ergocraft.in',
  url: 'https://ergocraft.in',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '1st Floor Gala No, Harihar Compound, Building No, A/21, Mankoli - Anjurphata Rd, near Gajanan Petrol Pump, Dapode',
    addressLocality: 'Bhiwandi',
    addressRegion: 'Maharashtra',
    postalCode: '421302',
    addressCountry: 'IN',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 19.2968,
    longitude: 73.0631,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      opens: '09:30',
      closes: '19:30',
    },
  ],
  priceRange: '₹₹₹',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    reviewCount: '128',
    bestRating: '5',
    worstRating: '1',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F7F5F0] text-[#242620]">
        <Suspense fallback={<div className="min-h-screen bg-[#F7F5F0]" />}>
          <AuthProvider>
            <CartProvider>
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
              <CartDrawer />
            </CartProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
