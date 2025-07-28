// src/app/news/page.tsx

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebarNews from "@/components/RightSideBarNews";
import ClientOnly from '@/components/ClientOnly';
import SportsNav from "@/components/SportsNav";
import PaginationControls from '@/components/PaginationControls';

import { fetchNewsList } from "@/lib/news-api";
import { fetchTeamOfTheWeek, fetchTopLeagues } from "@/lib/api";
import { NewsArticleSummary } from '@/lib/types';
import BackButton from '@/components/BackButton';

// --- THE FIX for "Invalid Date" ---
// A robust helper function to safely format dates.
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const metadata: Metadata = {
  // Title: Under 60 characters. Clear, concise, and keyword-rich.
  title: 'Latest Sports News & Headlines',

  // Description: Under 160 characters. A compelling summary of the page content.
  description: 'Stay up-to-date with breaking sports news, transfer rumors, and expert analysis. Get the latest headlines for football, basketball, tennis, and more.',

  // Keywords for context and for search engines that still use them.
  keywords: ['sports news', 'latest news', 'football news', 'transfer news', 'basketball', 'tennis', 'sports headlines', 'live scores news', 'sports updates'],
    // ADDED: Author for brand consistency
  authors: [{ name: 'TodayLiveScores' }],

  // ADDED: Publisher for brand consistency
  publisher: 'TodayLiveScores',

  // Canonical URL to define the authoritative page for search engines.
  alternates: {
    canonical: 'https://todaylivescores.com/news', // Assuming your page route is /news
  },

  // Open Graph tags for optimized sharing on social platforms like Facebook.
  openGraph: {
    title: 'Latest Sports News & Headlines | TLiveScores',
    description: 'Stay up-to-date with breaking sports news, transfer rumors, and expert analysis. Your daily source for sports headlines.',
    url: '/news',
    siteName: 'TLiveScores',
    // IMPORTANT: Create an image (1200x630px) and place it in your /public folder.
    images: [
      {
        url: '/social-card-news.png', // Replace with your actual image path
        width: 1200,
        height: 630,
        alt: 'The latest sports news headlines on TLiveScores',
      },
    ],
    locale: 'en_US',
    type: 'website',
     authors: ['TodayLiveScores'],
  },

  // Twitter-specific tags for a great appearance when shared on Twitter.
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Sports News & Headlines | TLiveScores',
    description: 'Stay up-to-date with breaking sports news, transfer rumors, and expert analysis. Your daily source for sports headlines.',
    images: ['/social-card-news.png'], // Must be the same as og:image
  },

  // Clear instructions for search engine crawlers.
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};


export default async function NewsListingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [
    allNews,
    teamOfTheWeek,
    topLeagues,
  ] = await Promise.all([
    fetchNewsList(),
    fetchTeamOfTheWeek(),
    fetchTopLeagues(),
  ]);

  const latestNewsForSidebar = allNews.slice(0, 5); // Slice to a reasonable number for the sidebar

  // Pagination Logic
  const page = searchParams['page'] ?? '1';
  const perPage = 6;
  const start = (Number(page) - 1) * perPage;
  const end = start + perPage;
  const paginatedArticles = allNews.slice(start, end);

  return (
    <div className="bg-[#1d222d] text-gray-200 min-h-screen">
      <Header />
      <SportsNav />
      
      <div className="container mx-auto px-4 py-8">
        <BackButton />
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 border-b border-gray-700 pb-4">
              Latest News
            </h1>
        <div className="lg:flex lg:gap-8">
          
          <aside className="w-full lg:w-64 lg:order-1 flex-shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-8 lg:self-start">
            <LeftSidebar 
              teamOfTheWeek={teamOfTheWeek} 
              latestNews={latestNewsForSidebar} 
            />
          </aside>
          
          <main className="w-full lg:flex-1 lg:order-2 lg:min-w-0">
            
            {paginatedArticles && paginatedArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedArticles.map((article) => (
                    // --- THE FIX for all properties ---
                    <NewsArticleCard key={article.id} article={article} />
                  ))}
                </div>
                
                <PaginationControls
                  hasNextPage={end < allNews.length}
                  hasPrevPage={start > 0}
                  totalArticles={allNews.length}
                  perPage={perPage}
                />
              </>
            ) : (
              <div className="text-center py-20 bg-[#2b3341] rounded-lg">
                <p className="text-gray-300 text-xl font-semibold">No News Articles Found</p>
                <p className="text-gray-500 text-md mt-2">Please check back later.</p>
              </div>
            )}
          </main>
          
          <aside className="hidden lg:block lg:w-72 lg:order-3 flex-shrink-0 lg:sticky lg:top-8 lg:self-start">
            <RightSidebarNews 
              initialTopLeagues={topLeagues} 
              initialFeaturedMatch={null}
            />
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

// --- THIS ENTIRE COMPONENT HAS BEEN CORRECTED ---
const NewsArticleCard = ({ article }: { article: NewsArticleSummary }) => (
  // FIX: Use `_id` for the key.
  <Link href={`/news/${article.slug}`} className="block group">
    <div className="bg-[#2b3341] rounded-lg overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="relative w-full h-48">
        {/* FIX: Use `imageUrl`. */}
        {article.image_url ? (
          <Image src={article.image_url} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gray-700/50 flex items-center justify-center"><span className="text-gray-400 text-sm">No Image</span></div>
        )}
      </div>
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{article.title}</h2>
        {/* FIX: Use `summary`. It is guaranteed to exist by the API logic. */}
        <p className="text-gray-400 text-sm mb-4 flex-grow">{article.summary}</p>
        <p className="text-xs text-gray-500 mt-auto pt-3 border-t border-gray-700/50">
          <ClientOnly>
            {/* FIX: Use `publishedAt` and the robust `formatDate` function. */}
            {formatDate(article.publishedAt)}
          </ClientOnly>
        </p>
      </div>
    </div>
  </Link>
);


