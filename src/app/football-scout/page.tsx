
import { fetchInjuriesFromApi, fetchTeamOfTheWeek, fetchTopLeagues } from "@/lib/api";
import { fetchNewsList } from "@/lib/news-api";
import InjuryModel from "@/models/Injury";
import dbConnect from "@/lib/mongodb";
import { IInjuryData } from "@/lib/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SportsNav from "@/components/SportsNav";
import LeftSidebar from "@/components/LeftSidebar";
import RightSidebarScout from "@/components/RightSideBarScout";
import PublicInjuriesTable from "@/components/PublicInjuriesTable";
import RelatedPosts from "@/components/RelatedPosts";
import Post from "@/models/Post";
import { IPost } from "@/models/Post";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'TodayLiveScores | Football scout',
  description: 'Today Live Scores track all player statuses with Football Scout. View live injury updates, chance of playing, and availability of football players.',
  keywords: ['Football Scout'],
  authors: [{ name: 'TodayLiveScores' }],
  publisher: 'TodayLiveScores',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://todaylivescores.com/football-scout',
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

export default async function InjuriesPage() {
  await dbConnect();

  const [
    manualInjuries,
    apiInjuriesResponse,
    teamOfTheWeek,
    allNews,
    topLeagues,
    relatedPosts
  ] = await Promise.all([
    InjuryModel.find({}).sort({ lastUpdated: -1 }).lean(),
    fetchInjuriesFromApi("39"),
    fetchTeamOfTheWeek(),
    fetchNewsList(),
    fetchTopLeagues(),
    getRelatedPosts()
  ]);

  const latestNewsForSidebar = allNews.slice(0, 5);
  const safeManualInjuries = manualInjuries || [];
  const safeApiInjuries = apiInjuriesResponse || [];

  const manualInjuryPlayerIds = new Set(safeManualInjuries.map(inj => inj.playerId));

  const automatedInjuries = safeApiInjuries
    .filter(apiInjury => apiInjury && apiInjury.player && !manualInjuryPlayerIds.has(apiInjury.player.id))
    .map((apiInjury): IInjuryData | null => {
      if (!apiInjury.team || !apiInjury.injury || !apiInjury.fixture) return null;
      return {
        _id: `api-${apiInjury.player.id}`,
        playerId: apiInjury.player.id,
        playerName: apiInjury.player.name,
        playerPhoto: apiInjury.player.photo,
        teamId: apiInjury.team.id,
        teamName: apiInjury.team.name,
        teamLogo: apiInjury.team.logo,
        status: (apiInjury.injury.type === 'Suspended' || apiInjury.injury.type === 'Red Card') ? 'Disciplinary' : 'Injured',
        details: apiInjury.injury.reason,
        returnDate: 'Unknown',
        lastUpdated: new Date(apiInjury.fixture.date),
        isApiEntry: true,
      };
    })
    .filter(Boolean) as IInjuryData[];

  const serializedManualInjuries = safeManualInjuries.map(injury => ({
    ...injury,
    _id: injury._id.toString(),
    lastUpdated: injury.lastUpdated,
  }));

  const combinedInjuries = [...serializedManualInjuries, ...automatedInjuries].sort(
    (a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime()
  );

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
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mt-3">Football Scout - Player Availability and Chances of Playing</h1>
                    <p className="text-gray-400 mt-2">As a football scout, your goal is to assess player availability across all positions—Goalkeepers, Defenders, Midfielders, and Forwards—to determine their Chance of Playing. This guide explains how to interpret injury status and other absences such as Doubt, Knock, Disciplinary, On Loan, or Unavailable.</p>
                </div>
                <PublicInjuriesTable injuries={combinedInjuries} />

                <div className="text-gray-400 mt-12 space-y-6">
                    <h2 className="text-2xl font-bold text-white">Understanding Status Categories</h2>
                    <ul className="space-y-2 list-disc list-inside">
                        <li><span className="font-semibold text-white">Injured / Out (Unavailable):</span> The player is ruled out—definitely not playing.</li>
                        <li><span className="font-semibold text-white">Doubt (≈ 50% Chance):</span> Status uncertain; participation could go either way.</li>
                        <li><span className="font-semibold text-white">75% Chance (Likely to Play):</span> Minor issues; expected to participate.</li>
                        <li><span className="font-semibold text-white">Knock:</span> A minor injury; player may be fit after treatment or matchday decisions.</li>
                        <li><span className="font-semibold text-white">Disciplinary:</span> Suspensions due to cards or bans—status often firm with clear return dates.</li>
                        <li><span className="font-semibold text-white">On Loan:</span> Not available for selection by your team until return.</li>
                    </ul>

                    <h3 className="text-xl font-bold text-white pt-4">Goalkeepers</h3>
                    <p>Scouts need to monitor key absences, such as a knee or ankle injury or suspensions affecting regular starters. For example, at Newcastle, Karl Darlow is injured (ankle) and out with a return potentially in September. A loaned-out keeper is also considered Unavailable until recalled or transferred.</p>
                    
                    <h3 className="text-xl font-bold text-white pt-4">Defenders</h3>
                    <p>Assessing defenders involves tracking injury types (e.g. hamstring, knee) and match-fitness concerns. For instance, Yerson Mosquera was listed with a knee knock, rated 25% and currently Unavailable from May until mid‑August. Disciplinary bans or red cards also affect defenders, turning them Unavailable for a set number of games.</p>
                    
                    <h3 className="text-xl font-bold text-white pt-4">Midfielders</h3>
                    <p>Midfielders often face muscular or knock issues. Reviewing Leicester news, players like Yves Bissouma or Pape Matar Sarr were sidelined due to knocks, with varying chances of playing as speculation continued until matchday decisions. Suspensions or illness—e.g. Richarlison (illness, doubtful)—impact availability.</p>
                    
                    <h3 className="text-xl font-bold text-white pt-4">Forwards</h3>
                    <p>Strikers frequently miss games due to hamstring injuries or illness. For example, Richarlison is out with a hamstring strain until December. Monitoring return timelines helps scouts gauge whether to invest in alternative options for upcoming fixtures, especially when a player remains doubtful or unavailable.</p>

                    <h2 className="text-2xl font-bold text-white pt-6">Why This Matters to the Football Scout</h2>
                    <ul className="space-y-2 list-disc list-inside">
                        <li><span className="font-semibold text-white">Transfer & Lineup Decisions:</span> Knowing who’s injured, doubtful, suspended, or on loan helps scouts advise managers on which players can realistically deliver.</li>
                        <li><span className="font-semibold text-white">Strategy Planning:</span> Scouts can track return dates and status updates to recommend replacements or alternate tactics.</li>
                        <li><span className="font-semibold text-white">Fantasy Insight:</span> For fantasy scouts, availability status helps determine captain picks and bench decisions—essential for maximizing points.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white pt-6">How to Use This Page - Aligned with the Today Live Scores</h2>
                    <ul className="space-y-2 list-disc list-inside">
                        <li>Track all position groups — Goalkeepers, Defenders, Midfielders, Forwards — with the same live-updating clarity that a real-time Today Live Score feed offers. Just as you’d refresh a live match ticker, your scout page reflects up-to-the-minute availability changes.</li>
                        <li>Label statuses clearly using the standard categories: Injured, Doubtful, Knock, Disciplinary, On Loan, or Unavailable. In the spirit of live score updates, each status update appears ready to “kick off” your reader’s attention instantly.</li>
                        <li>Estimate playing chances in a format echoing live score probabilities—e.g., 75% (Likely), ~50% (Doubtful), 25% (Unlikely), or 0% (Unavailable)—mirroring how a live score site might show the likelihood of match events unfolding.</li>
                        <li>Update return dates as new official status changes occur, much like adding goal timestamps or red card events to a running live feed.</li>
                        <li>Recommend alternatives and tactical adjustments based on a player’s live availability—just as live score platforms signal tactical shifts or substitutions in real time.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-white pt-6">Rising Injury Trends & Scout Role</h2>
                    <p>In the 2024‑25 season, hamstring injuries accounted for 24% of total injuries, with recovery times often exceeding 30 days—linked to high‑intensity play and congested schedules. As a football scout, staying informed about these trends enables better decision‑making regarding player risk and sustainability. AI tools are emerging to assist scouts in predicting injury likelihood and managing player load.</p>
                </div>
            </div>
          </main>

          <aside className="hidden lg:block lg:w-72 lg:order-3 flex-shrink-0 lg:sticky lg:top-8 lg:self-start">
            <RightSidebarScout
              initialTopLeagues={topLeagues}
              initialFeaturedMatch={null}
            />
            <div  className="mt-3">
                 <RelatedPosts posts={relatedPosts} />
            </div>
          </aside>
        </div>
      </div>

      <Footer />
    </div>
  );
}

          