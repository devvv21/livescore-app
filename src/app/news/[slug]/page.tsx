// src/app/news/[slug]/page.tsx

import { notFound } from "next/navigation";
import { Metadata } from 'next';

import { fetchNewsBySlug } from "@/lib/news-api";
import { fetchTopLeagues } from "@/lib/api";
import dbConnect from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";

import ArticleBody from "@/components/ArticleBody";
import BackToNewsButton from "@/components/BackToNewsButton";
import Header from "@/components/Header";
import SportsNav from "@/components/SportsNav";
import Footer from "@/components/Footer";
import RightSidebarNews from "@/components/RightSideBarNews";
import RelatedPosts from "@/components/RelatedPosts";
import "../news.css";

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
  let finalDescription = '';
  const minDescriptionLength = 70;

  if (article.summary && article.summary.length > minDescriptionLength) {
    finalDescription = article.summary.slice(0, 155) + (article.summary.length > 155 ? '...' : '');
  } else {
    const fallback = `Read the full story on "${title}". Get in-depth analysis and the latest updates on TLiveScores, your definitive source for breaking sports news.`;
    finalDescription = fallback.slice(0, 155) + (fallback.length > 155 ? '...' : '');
  }

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

  const authorNames = (article.creator && article.creator.length > 0) 
    ? article.creator 
    : ['TLiveScores Staff'];

  const siteUrl ='https://todaylivescores.com';
  const canonicalUrl = `${siteUrl}/news/${article.slug}`;
  const imageUrl = article.image_url || `${siteUrl}/default-social-card.png`;

  return {
    title,
    description: finalDescription,
    keywords: keywords.slice(0, 7),
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
      authors: authorNames,
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

async function getRelatedPosts(): Promise<IPost[]> {
  await dbConnect();
  const posts = await Post.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title slug featuredImageUrl createdAt")
    .lean();
  return posts as IPost[];
}

export default async function NewsArticlePage({ params }: Props) {
  const [
    article,
    topLeagues,
    rawRelatedPosts
  ] = await Promise.all([
    fetchNewsBySlug(params.slug),
    fetchTopLeagues(),
    getRelatedPosts(),
  ]);

  if (!article) {
    notFound();
  }

  const relatedPosts = rawRelatedPosts.map(post => ({
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt.toString(),
  }));

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
            <RightSidebarNews 
              initialTopLeagues={topLeagues} 
              initialFeaturedMatch={null}
            />
            <div className="mt-8">
              <RelatedPosts posts={relatedPosts} />
            </div>
          </aside>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}