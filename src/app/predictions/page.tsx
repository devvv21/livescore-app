// src/app/predictions/page.tsx

import { format } from 'date-fns';
import { Metadata } from 'next';

// --- ADD IMPORTS FOR LAYOUT COMPONENTS ---
import Header from "@/components/Header";
import SportsNav from "@/components/SportsNav";
import Footer from "@/components/Footer";
import LeftSidebar from '@/components/LeftSidebar';
import RightSidebarPredictions from '@/components/RightSidebarPredictions';

// --- ADD IMPORTS FOR DATA FETCHING ---
import { fetchMatchesByDate, fetchTopLeagues, fetchTeamOfTheWeek } from '@/lib/api';
import { fetchNewsList } from '@/lib/news-api';
import { getMatchPrediction } from '@/lib/predictions';
import { IPrediction } from '@/models/Prediction';

// --- IMPORTS FOR PREDICTION COMPONENTS (Unchanged) ---
import DateNavigator from '@/components/predictions/DateNavigator';
import LeaguePredictionGroup from '@/components/predictions/LeaguePredictionGroup'; 
import PredictionMatchCard from '@/components/predictions/PredictionMatchCard';

// --- SEO Metadata for the Predictions Page ---
export const metadata: Metadata = {
  title: 'TodayLiveScores | Daily Match Predictions',
  description: 'Get daily match predictions at Today Live Scores and odds for upcoming football fixtures from around the world. In-depth analysis for your favorite leagues.',
  keywords: ['match predictions', 'football odds', 'daily fixtures', 'sports betting tips'],
  alternates: {
    canonical: 'https://todaylivescores.com/predictions',
  },
};

export const revalidate = 60; // Revalidate the page every 60 seconds

export default async function PredictionsPage({ 
  searchParams 
}: { 
  searchParams: { date?: string } 
}) {
  const dateStr = searchParams.date || format(new Date(), 'yyyy-MM-dd');
  const selectedDate = new Date(dateStr + 'T00:00:00'); // Use a consistent date object

  // --- STEP 1: FETCH ALL DATA FOR THE PAGE AND SIDEBARS CONCURRENTLY ---
  const [
    leagueGroups,
    topLeagues,
    teamOfTheWeekPlayers,
    allNews
  ] = await Promise.all([
    fetchMatchesByDate(dateStr),
    fetchTopLeagues(),
    fetchTeamOfTheWeek(),
    fetchNewsList()
  ]).catch(error => {
    console.error("Failed to fetch predictions page data:", error);
    return [[], [], [], []];
  });

  // --- STEP 2: ENRICH THE MATCH DATA WITH PREDICTIONS ---
  const enrichedLeagueGroups = Array.isArray(leagueGroups)
    ? await Promise.all(
        leagueGroups.map(async (group) => {
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

  // --- STEP 3: PREPARE DATA FOR COMPONENTS ---
  const latestNewsForSidebar = Array.isArray(allNews) ? allNews.slice(0, 3) : [];
  const liveMatchCount = Array.isArray(enrichedLeagueGroups)
    ? enrichedLeagueGroups.reduce((count, group) => {
        return count + group.matches.filter(match => match.status === 'LIVE' || match.status === 'HT').length;
      }, 0)
    : 0;

  // --- STEP 4: RENDER THE FULL PAGE LAYOUT ---
  return (
    <div className="bg-[#1d222d] text-gray-200 min-h-screen">
      <Header />
      <SportsNav liveMatchCount={liveMatchCount} />
      <main className="container mx-auto px-4 py-6">
        <div className="lg:flex lg:gap-6">

          {/* Left Sidebar */}
          <aside className="w-full lg:w-64 lg:order-1 flex-shrink-0 mb-6 lg:mb-0 lg:sticky lg:top-4 lg:self-start">
            <LeftSidebar 
              teamOfTheWeek={teamOfTheWeekPlayers} 
              latestNews={latestNewsForSidebar} 
            />
          </aside>

          {/* Main Content (Your Predictions List) */}
          <div className="w-full lg:flex-1 lg:order-2 lg:min-w-0">
            <DateNavigator />
            {enrichedLeagueGroups && enrichedLeagueGroups.length > 0 ? (
              enrichedLeagueGroups.map((group) => (
                <LeaguePredictionGroup
                  key={group.leagueName}
                  leagueName={group.leagueName}
                  leagueLogo={group.leagueLogo}
                  countryName={group.countryName}
                >
                  {group.matches.map((match) => (
                    <PredictionMatchCard key={match.id} match={match} />
                  ))}
                </LeaguePredictionGroup>
              ))
            ) : (
              <div className="text-center py-20 bg-[#2b3341] rounded-lg">
                <h3 className="text-xl font-bold text-white">No Matches Found</h3>
                <p className="text-gray-400 mt-2">There are no scheduled matches for this date.</p>
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-8">
                Predictions are based on an algorithmic analysis and are for informational purposes only.
            </p>
          </div>

          {/* Right Sidebar */}
          <aside className="hidden lg:block lg:w-72 lg:order-3 flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
            <RightSidebarPredictions 
              initialTopLeagues={topLeagues} 
              initialFeaturedMatch={null} // Predictions page doesn't have a single featured match
            />
          </aside>

        </div>
      </main>
      <Footer />
    </div>
  );
}