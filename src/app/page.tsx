// src/app/page.tsx

import Footer from "@/components/Footer";
import { Metadata } from 'next';
import DashboardWrapper from "@/components/DashboardWrapper";
import { IPrediction } from "@/models/Prediction"; 
import RelatedPosts from "@/components/RelatedPosts";
import dbConnect from "@/lib/mongodb";
import Post, { IPost } from "@/models/Post";

import { 
  fetchDashboardData, 
  fetchTopLeagues, 
  fetchTeamOfTheWeek, 
} from "@/lib/api";
import { fetchNewsList } from "@/lib/news-api";

import { getMatchPrediction } from "@/lib/predictions";

export const metadata: Metadata = {
  title: 'Live Sports Scores, Fixtures & Results',
  description: 'Get instant live scores, upcoming fixtures, and final results for football, basketball, tennis, and more. Your go-to source for the fastest sports updates.',
  keywords: ['live scores', 'today live scores', 'football scores', 'sports results', 'fixtures', 'standings', 'live football', 'basketball scores', 'tennis scores', 'todaylivescores'],
  alternates: {
    canonical: 'https://todaylivescores.com/',
  },
  openGraph: {
    title: 'Live Sports Scores, Fixtures & Results | TodayLiveScores',
    description: 'Your go-to source for the fastest updates in football, basketball, tennis, and more.',
    url: '/',
    siteName: 'TodayLiveScores',
    images: [
      {
        url: '/social-card-home.png',
        width: 1200,
        height: 630,
        alt: 'Live sports scores and fixtures on TodayLiveScores',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Live Sports Scores, Fixtures & Results | TodayLiveScores',
    description: 'Your go-to source for the fastest updates in football, basketball, tennis, and more.',
    images: ['/social-card-home.png'],
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

export default async function Home() {
  const [
    initialMatches, 
    topLeagues, 
    teamOfTheWeekPlayers, 
    allNews,
    rawRelatedPosts
  ] = await Promise.all([
    fetchDashboardData(),
    fetchTopLeagues(),
    fetchTeamOfTheWeek(),
    fetchNewsList(),
    getRelatedPosts()
  ]).catch(error => {
    console.error("Failed to fetch initial page data:", error);
    return [[], [], [], [], []]; 
  });

  const initialMatchesWithPredictions = Array.isArray(initialMatches) 
    ? await Promise.all(
        initialMatches.map(async (group) => {
          const matchesWithPredictions = await Promise.all(
            group.matches.map(async (match) => {
              const predictionData = await getMatchPrediction(match);
              const plainPrediction = predictionData ? JSON.parse(JSON.stringify(predictionData)) : null;
              return { ...match, prediction: plainPrediction };
            })
          );
          return { ...group, matches: matchesWithPredictions };
        })
      )
    : [];
    
  const relatedPosts = rawRelatedPosts.map(post => ({
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt.toString(),
  }));

  const featuredMatch = Array.isArray(initialMatchesWithPredictions) 
      ? initialMatchesWithPredictions.flatMap(g => g.matches).find(m => m.status === 'LIVE' || m.status === 'HT') || null
      : null;
  
  const latestNewsForSidebar = Array.isArray(allNews) ? allNews.slice(0, 3) : [];

  return (
    <div className="bg-[#1d222d] text-gray-200 min-h-screen">
      <DashboardWrapper
        initialMatches={initialMatchesWithPredictions}
        initialTopLeagues={topLeagues}
        initialTeamOfTheWeek={teamOfTheWeekPlayers}
        initialLatestNews={latestNewsForSidebar}
        initialFeaturedMatch={featuredMatch}
        initialRelatedPosts={relatedPosts}
      />
      <Footer />
    </div>
  );
}