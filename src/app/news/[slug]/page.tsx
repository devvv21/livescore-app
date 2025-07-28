// src/app/news/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from 'next';

// Data fetching functions
import { fetchNewsBySlug, fetchNewsList } from "@/lib/news-api";
import { fetchTeamOfTheWeek, fetchTopLeagues } from "@/lib/api";

// Component Imports
import ArticleBody from "@/components/ArticleBody";
import BackToNewsButton from "@/components/BackToNewsButton";
import Header from "@/components/Header";
import SportsNav from "@/components/SportsNav";
import Footer from "@/components/Footer";
import RightSidebar from "@/components/RightSidebar";

type Props = { params: { slug: string } };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const article = await fetchNewsBySlug(params.slug);

  if (!article) {
    return {
      title: "Article Not Found",
      description: "The news article you are looking for could not be found.",
    };
  }

  const title = article.title || "News Article";
  
  // A robust description generator
  let finalDescription = '';
  const minDescriptionLength = 70; // Set a minimum acceptable length

  // First, check if the API summary is good enough
  if (article.summary && article.summary.length > minDescriptionLength) {
    // If it's good, use it, but make sure it's not too long
    finalDescription = article.summary.slice(0, 155) + (article.summary.length > 155 ? '...' : '');
  } else {
    // If the summary is too short or missing, generate a better one from the title.
    const fallback = `Read the full story on "${title}". Get in-depth analysis and the latest updates on TLiveScores, your definitive source for breaking sports news.`;
    // Ensure the generated fallback also respects the length limit.
    finalDescription = fallback.slice(0, 155) + (fallback.length > 155 ? '...' : '');
  }

  // Handle keywords
  let keywords: string[] = [];
  if (article.keywords) {
    if (Array.isArray(article.keywords)) {
      keywords = article.keywords;
    } else if (typeof article.keywords === 'string') {
      keywords = article.keywords.split(',').map(k => k.trim());
    }
  }
  if (keywords.length === 0) {
    keywords = title.split(' ').slice(0, 10);
  }

  // --- FIX: Prepare author data for consistency ---
  const authorNames = (article.creator && article.creator.length > 0) 
    ? article.creator 
    : ['TLiveScores Staff'];

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://todaylivescores.com/';
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;
  const imageUrl = article.image_url || `${siteUrl}/default-social-card.png`;

  return {
    title,
    description: finalDescription,
    keywords: keywords.slice(0, 7),
    
    // --- FIX: Add top-level publisher and author metadata ---
    publisher: 'TLiveScores',
    authors: authorNames.map(name => ({ name: name })),

    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${title} | TLiveScores`,
      description: finalDescription,
      url: canonicalUrl,
      siteName: 'TLiveScores',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: article.publishedAt,
      authors: authorNames, // Use consistent author data here
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | TLiveScores`,
      description: finalDescription,
      images: [imageUrl],
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
}


// The page component
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

  return (
    <div className="bg-[#1d222d] text-gray-200 min-h-screen">
      <Header />
      <SportsNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="lg:flex lg:gap-8">
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