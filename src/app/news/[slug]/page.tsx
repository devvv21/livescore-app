// src/app/news/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from 'next';
import * as cheerio from 'cheerio';

// Data fetching functions
import { fetchNewsBySlug, fetchNewsList } from "@/lib/news-api";
import { fetchTeamOfTheWeek, fetchTopLeagues } from "@/lib/api";

// Component Imports
import ArticleBody from "@/components/ArticleBody";
import BackToNewsButton from "@/components/BackToNewsButton";
import Header from "@/components/Header";
import SportsNav from "@/components/SportsNav";
import Footer from "@/components/Footer";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebar from "@/components/RightSidebar";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchNewsBySlug(params.slug);

  if (!article) {
    return { title: "Article Not Found" };
  }

  const $ = cheerio.load(article.full_article || '');
  const mainTitle = $('h1').first().text().trim() || article.title || "Untitled Article";
  
  // --- NEW, CURATED KEYWORD LOGIC ---
  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'for', 'and', 'with', 'to', 'is', 'of', 'her', 'his', 'was', 'at', 'by']);
  const cleanWords = mainTitle.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(word => word.length > 1 && !stopWords.has(word));
  const allPhrases: string[] = [];
  if (cleanWords.length >= 3) {
    for (let i = 0; i <= cleanWords.length - 3; i++) {
      allPhrases.push(`${cleanWords[i]} ${cleanWords[i+1]} ${cleanWords[i+2]}`);
    }
  }
  if (cleanWords.length >= 2) {
    for (let i = 0; i <= cleanWords.length - 2; i++) {
      allPhrases.push(`${cleanWords[i]} ${cleanWords[i+1]}`);
    }
  }
  const uniqueKeywords = Array.from(new Set(allPhrases));
  const finalKeywords = uniqueKeywords.slice(0, 4).join(', ');

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;
  const safeDescription = article.description ? article.description.slice(0, 160) : 'No summary available.';
  let authorName = 'TodayLiveScores Staff';
  if (article.creator && Array.isArray(article.creator) && article.creator.length > 0) {
    authorName = article.creator.join(', ');
  }

  return {
    title: mainTitle,
    description: safeDescription,
    keywords: finalKeywords,
    author: [{ name: authorName }],
    publisher: 'TodayLiveScores',
    alternates: { canonical: canonicalUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: mainTitle,
      description: safeDescription,
      url: canonicalUrl,
      siteName: 'TodayLiveScores',
      images: [{ url: article.image_url || `${siteUrl}/default-news-image.jpg`, width: 1200, height: 630 }],
      locale: 'en_US',
      type: 'article',
    },
  };
}

// The default export component remains the same.
export default async function NewsArticlePage({ params }: Props) {
  const [
    article,
    allNews,
    teamOfTheWeek,
    topLeagues,
  ] = await Promise.all([
    fetchNewsBySlug(params.slug),
    fetchNewsList(),
    fetchTeamOfTheWeek(),
    fetchTopLeagues(),
  ]);

  if (!article) {
    notFound();
  }

  const latestNewsForSidebar = allNews.slice(0, 5);

  return (
    <div className="bg-[#1d222d] text-gray-200 min-h-screen">
      <Header />
      <SportsNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
          <aside className="w-full lg:w-64 lg:order-1 flex-shrink-0 mb-8 lg:mb-0 lg:sticky lg:top-8 lg:self-start">
            <LeftSidebar 
              teamOfTheWeek={teamOfTheWeek} 
              latestNews={latestNewsForSidebar}
            />
          </aside>
          
          <main className="w-full lg:flex-1 lg:order-2 lg:min-w-0">
            <article className="bg-[#2b3341] p-4 sm:p-6 rounded-lg">
              <BackToNewsButton text="Back to All News" />
              <ArticleBody article={article} />
            </article>
          </main>
          
          <aside className="hidden lg:block lg:w-72 lg:order-3 flex-shrink-0 lg:sticky lg:top-8 lg:self-start">
            <RightSidebar 
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