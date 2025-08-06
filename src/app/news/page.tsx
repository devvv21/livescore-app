// src/app/news/page.tsx

import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LeftSideNews from '@/components/LeftSideNews';
import RightSidebarNews from "@/components/RightSideBarNews";
import ClientOnly from '@/components/ClientOnly';
import SportsNav from "@/components/SportsNav";
import PaginationControls from '@/components/PaginationControls';
import BackButton from '@/components/BackButton';

import { fetchNewsList } from "@/lib/news-api";
import { fetchTeamOfTheWeek, fetchTopLeagues } from "@/lib/api";
import dbConnect from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";
import { NewsArticleSummary } from '@/lib/types';

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
  title: 'Latest Sports News & Headlines',
  description: 'Stay up-to-date with breaking sports news, transfer rumors, and expert analysis. Get the latest headlines for football, basketball, tennis, and more.',
  keywords: ['sports news', 'latest news', 'football news', 'transfer news', 'basketball', 'tennis', 'sports headlines', 'live scores news', 'sports updates'],
  authors: [{ name: 'TodayLiveScores' }],
  publisher: 'TodayLiveScores',
  alternates: {
    canonical: 'https://todaylivescores.com/news',
  },
  openGraph: {
    title: 'Latest Sports News & Headlines | TLiveScores',
    description: 'Stay up-to-date with breaking sports news, transfer rumors, and expert analysis. Your daily source for sports headlines.',
    url: '/news',
    siteName: 'TLiveScores',
    images: [
      {
        url: '/social-card-news.png',
        width: 1200,
        height: 630,
        alt: 'The latest sports news headlines on TLiveScores',
      },
    ],
    locale: 'en_US',
    type: 'website',
    authors: ['TodayLiveScores'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Latest Sports News & Headlines | TLiveScores',
    description: 'Stay up-to-date with breaking sports news, transfer rumors, and expert analysis. Your daily source for sports headlines.',
    images: ['/social-card-news.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

async function getRelatedPosts(): Promise<IPost[]> {
  await dbConnect();
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title slug featuredImageUrl createdAt")
    .lean();
  return posts as IPost[];
}

export default async function NewsListingPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const [
    allNews,
    teamOfTheWeek,
    topLeagues,
    rawRelatedPosts,
  ] = await Promise.all([
    fetchNewsList(),
    fetchTeamOfTheWeek(),
    fetchTopLeagues(),
    getRelatedPosts(),
  ]);

  const relatedPosts = rawRelatedPosts.map(post => ({
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt.toString(),
  }));

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
            <LeftSideNews 
              teamOfTheWeek={teamOfTheWeek} 
              posts={relatedPosts} 
            />
          </aside>
          
          <main className="w-full lg:flex-1 lg:order-2 lg:min-w-0">
            {paginatedArticles && paginatedArticles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedArticles.map((article) => (
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

const NewsArticleCard = ({ article }: { article: NewsArticleSummary }) => (
  <Link href={`/news/${article.slug}`} className="block group">
    <div className="bg-[#2b3341] rounded-lg overflow-hidden h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="relative w-full h-48">
        {article.image_url ? (
          <Image src={article.image_url} alt={article.title} fill sizes="(max-width: 768px) 100vw, 33vw" style={{ objectFit: 'cover' }} className="group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full bg-gray-700/50 flex items-center justify-center"><span className="text-gray-400 text-sm">No Image</span></div>
        )}
      </div>
      <div className="p-4 md:p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">{article.title}</h2>
        <p className="text-gray-400 text-sm mb-4 flex-grow">{article.summary}</p>
        <p className="text-xs text-gray-500 mt-auto pt-3 border-t border-gray-700/50">
          <ClientOnly>
            {formatDate(article.publishedAt)}
          </ClientOnly>
        </p>
      </div>
    </div>
  </Link>
);