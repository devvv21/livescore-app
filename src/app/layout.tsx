import type { Metadata } from 'next'; // Added for type safety
import { Inter } from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';

const inter = Inter({ subsets: ['latin'] });

// --- 1. Defined your schema data in a constant ---
const jsonLd = {
  "@context": "https://schema.org",
  "@type": ["Organization", "Place"],
  "name": "todaylivescores",
  "url": "https://todaylivescores.com/",
  "logo": {
    "@type": "ImageObject",
    "url": "https://i.postimg.cc/vBwqK79Z/1c9c4eee-7e94-423c-a5b1-4bb483e99aef.png",
    "contentUrl": "https://i.postimg.cc/vBwqK79Z/1c9c4eee-7e94-423c-a5b1-4bb483e99aef.png"
  },
  "sameAs": [
    "https://www.facebook.com/todaylivescoresofficial/",
    "https://x.com/todaylivescores",
    "https://www.youtube.com/@TodayLivesScoresOfficial",
    "https://za.pinterest.com/todaylivescores/",
    "https://medium.com/@todaylivescoressa"
  ],
  "description": "Todaylivescores has grown into a powerhouse for real-time sports coverage since its launch. It delivers instantaneous live scores, fixtures, results, standings, and in-depth match data for football, cricket, tennis, basketball, and hockey across world-class leagues and tournaments. The platform engages thousands of users monthly across 20+ popular leagues worldwide, forming a central hub for sports fans. Through the Todaylivescores app and web, users experience a seamless interface with fast updates, notifications, updated content, and synergy across media and betting systems.",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "19 Oakworth Rd, South End",
    "addressLocality": "Gqeberha",
    "postalCode": "6001",
    "addressCountry": "ZA"
  },
  "hasMap": "https://www.google.com/maps/place/19+Oakworth+Rd,+South+End,+Gqeberha,+6001,+South+Africa/"
};

// --- 2. Updated the metadata object ---
export const metadata: Metadata = {
  title: 'TodayLiveScores',
  description: 'Your go-to for live scores, stats, news and blogs.',
  // 3. Added the schema using the 'other' property
  other: {
    'application/ld+json': JSON.stringify(jsonLd),
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
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