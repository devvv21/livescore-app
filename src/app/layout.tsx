import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script'; // --- 1. IMPORT SCRIPT ---
import './globals.css';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] });

// --- 2. DEFINE YOUR SCHEMA DATA (this part is good) ---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "Place"],
  "name": "todaylivescores",
  "url": "https://todaylivescores.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://i.postimg.cc/vBwqK79Z/1c9c4eee-7e94-423c-a5b1-4bb4883e99aef.png",
    "contentUrl": "https://i.postimg.cc/vBwqK79Z/1c9c4eee-7e94-423c-a5b1-4bb483e99aef.png"
  },
  "sameAs": [
    "https://www.facebook.com/todaylivescoresofficial/",
    "https://x.com/todaylivescores",
    "https://www.youtube.com/@TodayLivesScoresOfficial",
    "https://za.pinterest.com/todaylivescores/",
    "https://medium.com/@todaylivescoressa"
  ],
  "description": "Todaylivescores has grown into a powerhouse for real-time sports coverage...",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "19 Oakworth Rd, South End",
    "addressLocality": "Gqeberha",
    "postalCode": "6001",
    "addressCountry": "ZA"
  },
  "hasMap": "https://www.google.com/maps/place/19+Oakworth+Rd,+South+End,+Gqeberha,+6001,+South+Africa/"
};

// --- 3. REMOVE THE SCHEMA FROM THE METADATA OBJECT ---
export const metadata: Metadata = {
  title: 'TodayLiveScores',
  description: 'Your go-to for live scores, stats, news and blogs.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      {/* --- 4. ADD THE SCRIPT COMPONENT TO THE <head> --- */}
      <head>
        <Script
          id="organization-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <NextTopLoader
          color="#3b82f6"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
        />
        {children}
      </body>
    </html>
  );
}