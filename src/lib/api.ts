// src/lib/api.ts

import { cache } from 'react';
import Team from '@/models/Team';
import dbConnect from './mongodb';
import HighlightModel, { IHighlight } from '@/models/Highlight';
import { Match, LeagueGroup, Standing, Player, ApiFixture, ApiOdd, ApiStanding, ApiPlayer, ApiLeague, MatchDetails } from "@/data/mockData";
import { format } from 'date-fns';
import { Highlight, Lineup, MatchLineupData } from './types';
import { groupMatchesByLeague, mapApiFixtureToMatch } from './apiUtils';


// ==================================================================
// === FOOTBALL API CONFIGURATION (No Changes)                    ===
// ==================================================================
const FOOTBALL_API_URL = 'https://v3.football.api-sports.io';
const FOOTBALL_API_KEY = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;

const footballServerOptions: RequestInit = {
  method: 'GET',
  headers: { 'x-apisports-key': FOOTBALL_API_KEY as string },
  next: { revalidate: 3600 } 
};

type Team = {
  id: number;
  name: string;
  logo: string;
};

export interface PlayerDetails {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  age: number;
  nationality: string;
  height: string;
  weight: string;
  photo: string;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
  };
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    position: string;
    rating: string;
  };
  statistics: {
    goals: number;
    assists: number;
    saves: number | null; // For goalkeepers
  };
};

export const fetchPlayerDetails = cache(async (playerId: string, season: string = "2024"): Promise<PlayerDetails | null> => {
  if (!FOOTBALL_API_KEY || !playerId) return null;

  try {
    const url = `${FOOTBALL_API_URL}/players?id=${playerId}&season=${season}`;
    const response = await fetch(url, footballServerOptions);
    
    if (!response.ok) {
      console.error(`[API Error] Failed to fetch player details for ID: ${playerId}`);
      return null;
    }

    const data = await response.json();
    const playerData = data.response?.[0];

    if (!playerData) {
      console.warn(`[API] No player details found for ID: ${playerId}`);
      return null;
    }

    // Map the raw API data to our clean PlayerDetails type
    const p = playerData;
    const stats = p.statistics[0]; // Assuming we always get one stats object for the season

    const mappedPlayer: PlayerDetails = {
      id: p.player.id,
      name: p.player.name,
      firstname: p.player.firstname,
      lastname: p.player.lastname,
      age: p.player.age,
      nationality: p.player.nationality,
      height: p.player.height || 'N/A',
      weight: p.player.weight || 'N/A',
      photo: p.player.photo,
      team: {
        id: stats.team.id,
        name: stats.team.name,
        logo: stats.team.logo,
      },
      league: {
        id: stats.league.id,
        name: stats.league.name,
        country: stats.league.country,
        logo: stats.league.logo,
        flag: stats.league.flag,
      },
      games: {
        appearences: stats.games.appearences || 0,
        lineups: stats.games.lineups || 0,
        minutes: stats.games.minutes || 0,
        position: stats.games.position || 'N/A',
        rating: parseFloat(stats.games.rating || '0').toFixed(1),
      },
      statistics: {
        goals: stats.goals.total || 0,
        assists: stats.goals.assists || 0,
        saves: stats.goals.saves, // This can be null for non-goalkeepers
      }
    };

    return mappedPlayer;

  } catch (error) {
    console.error(`[fetchPlayerDetails] A critical error occurred:`, error);
    return null;
  }
});

export const fetchMatchesByDate = cache(async (date: string): Promise<LeagueGroup[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const response = await fetch(`${FOOTBALL_API_URL}/fixtures?date=${date}`, footballServerOptions);
        if (!response.ok) return [];
        const data = await response.json();
        const allFixtures: ApiFixture[] = data.response || [];
        const matches = allFixtures.map(mapApiFixtureToMatch).filter(Boolean) as Match[];
        // Sort matches by time
        matches.sort((a, b) => a.time.localeCompare(b.time));
        return groupMatchesByLeague(matches);
    } catch (error) {
        console.error("Error fetching matches by date:", error);
        return [];
    }
});
// --- MAPPING FUNCTIONS (No Changes) ---
function mapStatus(status: any): { status: Match['status'], time?: string } {
    if (['FT', 'AET', 'PEN'].includes(status.short)) return { status: 'FT', time: 'FT' };
    if (status.short === 'HT') return { status: 'HT', time: 'HT' };
    if (status.short === 'NS') return { status: 'UPCOMING', time: 'Upcoming' };
    if (status.elapsed) return { status: 'LIVE', time: `${status.elapsed}'` };
    return { status: 'UPCOMING', time: status.short };
}
export function mapApiFixtureToMatch(apiFixture: any): Match | null {
    if (!apiFixture || !apiFixture.fixture || !apiFixture.league) return null;
    let { status, time } = mapStatus(apiFixture.fixture.status);
    if (status === 'UPCOMING' && apiFixture.fixture.date) {
        time = format(new Date(apiFixture.fixture.date), 'HH:mm');
    }
    const match: Match = {
        id: apiFixture.fixture.id, time: time || '', status,
        homeTeam: { name: apiFixture.teams.home.name, logo: apiFixture.teams.home.logo },
        awayTeam: { name: apiFixture.teams.away.name, logo: apiFixture.teams.away.logo },
        score: `${apiFixture.goals.home ?? '-'} - ${apiFixture.goals.away ?? '-'}`,
        league: { id: apiFixture.league.id, name: apiFixture.league.name, logo: apiFixture.league.logo, country: apiFixture.league.country, flag: apiFixture.league.flag,  }
    };
    return match;
}
export function groupMatchesByLeague(matches: Match[]): LeagueGroup[] {
  if (!matches || matches.length === 0) return [];
  const grouped = matches.reduce((acc, match) => {
    const leagueName = match.league.name;
    if (!acc[leagueName]) {
      acc[leagueName] = { leagueName: leagueName, leagueLogo: match.league.logo || '', countryName: match.league.country || 'World', countryFlag: match.league.flag || '', matches: [] };
    }
    acc[leagueName].matches.push(match);
    return acc;
  }, {} as Record<string, LeagueGroup>);
  return Object.values(grouped);
}

export const getTeamDetails = async (teamId: number) => {
  console.log(`[GET_TEAM_DETAILS] Process started for team ID: ${teamId}`);
  
  await connectToDB();

  const teamFromDb = await Team.findOne({ apiId: teamId });

  if (!teamFromDb) {
    console.error(`[GET_TEAM_DETAILS] Team with apiId ${teamId} not found in the database.`);
    return null; // The team must exist from the initial sync
  }

  const CACHE_DURATION_HOURS = 6;
  let isCacheValid = false;

  if (teamFromDb.detailsLastUpdatedAt) {
    const ageInHours = (new Date().getTime() - teamFromDb.detailsLastUpdatedAt.getTime()) / (1000 * 60 * 60);
    if (ageInHours < CACHE_DURATION_HOURS) {
      isCacheValid = true;
    }
  }

  // If we have fresh data in the cache, return it immediately
  if (isCacheValid) {
    console.log(`[GET_TEAM_DETAILS] Serving fresh data for team ${teamId} from DB cache.`);
    return JSON.parse(JSON.stringify(teamFromDb));
  }

  // --- If cache is invalid or missing, fetch from API ---
  console.log(`[GET_TEAM_DETAILS] Cache invalid or missing. Fetching new data for team ${teamId} from Football API.`);
  
  try {
    // Fetch all details in parallel
    const [fixtures, squad] = await Promise.all([
      fetchTeamFixtures(teamId.toString()), // Assumes this function exists in your api.ts
      fetchTeamSquad(teamId.toString()),   // Assumes this function exists in your api.ts
    ]);
    
    // Now, update the team document in the database with the new data
    const updatedTeam = await Team.findOneAndUpdate(
      { apiId: teamId },
      {
        $set: {
          fixtures: fixtures,
          squad: squad,
          detailsLastUpdatedAt: new Date(), // <-- Update the timestamp!
        },
      },
      { new: true } // This option returns the document after the update has been applied
    );

    console.log(`[GET_TEAM_DETAILS] Successfully fetched and updated DB for team ${teamId}.`);
    return JSON.parse(JSON.stringify(updatedTeam));

  } catch (error) {
    console.error(`[GET_TEAM_DETAILS] Failed to fetch or save details for team ${teamId}:`, error);
    // If the API fails, it's better to return the old data than nothing at all
    return JSON.parse(JSON.stringify(teamFromDb));
  }
};

function mapApiStandingToStanding(apiStanding: ApiStanding): Standing {
    return {
        rank: apiStanding.rank, team: { id: apiStanding.team.id, name: apiStanding.team.name, logo: apiStanding.team.logo },
        played: apiStanding.all.played, win: apiStanding.all.win, draw: apiStanding.all.draw, loss: apiStanding.all.loss,
        diff: apiStanding.goalsDiff.toString(), points: apiStanding.points,
        form: apiStanding.form?.split('').slice(0, 5) as ('W' | 'D' | 'L')[] || []
    };
}

// --- FOOTBALL API FETCHING FUNCTIONS (No Changes) ---
export const fetchDashboardData = cache(async (): Promise<LeagueGroup[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const [liveResponse, todayResponse] = await Promise.all([
            fetch(`${FOOTBALL_API_URL}/fixtures?live=all`, footballServerOptions),
            fetch(`${FOOTBALL_API_URL}/fixtures?date=${todayStr}`, footballServerOptions)
        ]);
        if (!liveResponse.ok || !todayResponse.ok) return [];
        const liveData = await liveResponse.json();
        const todayData = await todayResponse.json();
        const allFixtures: ApiFixture[] = Array.from(new Map([...(liveData.response || []), ...(todayData.response || [])].map(f => [f.fixture.id, f])).values());
        const matches = allFixtures.map(mapApiFixtureToMatch).filter(Boolean) as Match[];
        matches.sort((a, b) => { const order = { 'LIVE': 1, 'HT': 2, 'UPCOMING': 3, 'FT': 4 }; return order[a.status] - order[b.status]; });
        return groupMatchesByLeague(matches);
    } catch (error) { return []; }
});
export const fetchTopLeagues = cache(async (): Promise<ApiLeague[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const leagueIds = [39, 140, 135, 78, 61, 2, 3, 88, 94, 253];
        const responses = await Promise.all(leagueIds.map(id => fetch(`${FOOTBALL_API_URL}/leagues?id=${id}`, footballServerOptions)));
        const results = await Promise.all(responses.map(res => res.json()));
        return results.map(result => result.response[0]?.league).filter(Boolean);
    } catch (error) { return []; }
});
export const fetchStandings = cache(async (leagueId: string, season: string = "2024"): Promise<Standing[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const response = await fetch(`${FOOTBALL_API_URL}/standings?league=${leagueId}&season=${season}`, footballServerOptions);
        if (!response.ok) return [];
        const data = await response.json();
        const standingsData = data.response[0]?.league?.standings[0];
        return standingsData ? standingsData.map(mapApiStandingToStanding) : [];
    } catch (error) { return []; }
});
export const fetchAllTeamsInLeague = cache(async (leagueId: string, season: string = "2024"): Promise<Team[]> => {
  if (!FOOTBALL_API_KEY || !leagueId) return [];
  try {
    const url = `${FOOTBALL_API_URL}/teams?league=${leagueId}&season=${season}`;
    const response = await fetch(url, footballServerOptions);
    if (!response.ok) {
      console.error(`API Error: Failed to fetch teams for league ${leagueId}`);
      return [];
    }
    const data = await response.json();
    const teams: Team[] = (data.response || []).map((item: any) => ({
      id: item.team.id,
      name: item.team.name,
      logo: item.team.logo,
    }));
    return teams;
  } catch (error) {
    console.error("Error in fetchAllTeamsInLeague:", error);
    return [];
  }
});
export const fetchAllTeamsFromAllLeagues = cache(async (): Promise<{ leagueName: string, teams: { id: number, name: string, logo: string }[] }[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const leagueIds = [39, 140, 135, 78, 61, 2, 3, 88, 94, 253];
        const leagueDetailsPromises = leagueIds.map(id => fetch(`${FOOTBALL_API_URL}/leagues?id=${id}`, footballServerOptions).then(res => res.ok ? res.json() : null));
        const leagueDetailsResults = await Promise.all(leagueDetailsPromises);
        const leaguesMap = new Map(leagueDetailsResults.filter(Boolean).map(result => [result.response[0].league.id, result.response[0].league.name]));
        const teamsPromises = leagueIds.map(id => fetch(`${FOOTBALL_API_URL}/teams?league=${id}&season=2024`, footballServerOptions).then(res => res.ok ? res.json() : null));
        const teamsResults = await Promise.all(teamsPromises);
        return teamsResults.filter(Boolean).map(result => {
            const leagueId = result.parameters.league;
            const leagueName = leaguesMap.get(parseInt(leagueId)) || 'Unknown League';
            const teams = result.response.map((item: any) => ({ id: item.team.id, name: item.team.name, logo: item.team.logo }));
            return { leagueName, teams };
        });
    } catch (error) { return []; }
});
export const fetchTeamOfTheWeek = cache(async (leagueId: string = "39", season: string = "2024"): Promise<Player[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const url = `${FOOTBALL_API_URL}/players/topscorers?season=${season}&league=${leagueId}`;
        const response = await fetch(url, footballServerOptions);
        if (!response.ok) return [];
        const data = await response.json();
        
        const topPlayers: ApiPlayer[] = data.response?.slice(0, 11) || [];

        return topPlayers.map(p => ({ 
            id: p.player.id,
            name: p.player.name, 
            rating: parseFloat(p.statistics[0].games.rating || '0').toFixed(1), 
            logo: p.statistics[0].team.logo,
            // These two fields are ESSENTIAL for the new URL structure
            teamId: p.statistics[0].team.id,
            teamName: p.statistics[0].team.name,
            photo: p.player.photo 
        }));
    } catch (error) { 
        console.error("Error fetching Team of the Week:", error);
        return []; 
    }
});
export const fetchAllTopPlayers = cache(async (leagueId: string = "39", season: string = "2024"): Promise<Player[]> => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const url = `${FOOTBALL_API_URL}/players/topscorers?season=${season}&league=${leagueId}`;
        const response = await fetch(url, footballServerOptions);
        if (!response.ok) return [];
        const data = await response.json();
        const topPlayers: ApiPlayer[] = data.response || [];
        return topPlayers.map(p => ({ name: p.player.name, rating: parseFloat(p.statistics[0].games.rating || '0').toFixed(1), logo: p.statistics[0].team.logo, id: p.player.id, teamName: p.statistics[0].team.name }));
    } catch (error) {
        console.error("Error in fetchAllTopPlayers:", error);
        return [];
    }
});
export const fetchTeamInfo = cache(async (teamId: string) => {
    if (!FOOTBALL_API_KEY) return null;
    try {
        const res = await fetch(`${FOOTBALL_API_URL}/teams?id=${teamId}`, footballServerOptions);
        if (!res.ok) return null;
        const data = await res.json();
        return data.response[0] || null;
    } catch (error) { return null; }
});
export const fetchTeamFixtures = cache(async (teamId: string, season: string = "2024") => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const res = await fetch(`${FOOTBALL_API_URL}/fixtures?team=${teamId}&season=${season}`, footballServerOptions);
        if (!res.ok) return [];
        const data = await res.json();
        return (data.response || []).map(mapApiFixtureToMatch).filter(Boolean) as Match[];
    } catch (error) { return []; }
});
export const fetchTeamSquad = cache(async (teamId: string) => {
    if (!FOOTBALL_API_KEY) return [];
    try {
        const res = await fetch(`${FOOTBALL_API_URL}/players/squads?team=${teamId}`, footballServerOptions);
        if (!res.ok) return [];
        const data = await res.json();
        return data.response[0]?.players || [];
    } catch (error) { return []; }
});
export const fetchMatchDetailsById = cache(async (id: string): Promise<MatchDetails | null> => {
    if (!FOOTBALL_API_KEY) return null;
    try {
        const fixtureRes = await fetch(`${FOOTBALL_API_URL}/fixtures?id=${id}`, footballServerOptions);
        if (!fixtureRes.ok) return null;
        const fixtureData = await fixtureRes.json();
        const apiFixture: ApiFixture = fixtureData.response?.[0];
        if (!apiFixture) return null;
        const match: MatchDetails = mapApiFixtureToMatch(apiFixture) as MatchDetails;
        // The fixture object is needed by the YouTube function, so we attach it here.
        match.fixture = apiFixture.fixture;
        const [eventsRes, statsRes] = await Promise.all([
            fetch(`${FOOTBALL_API_URL}/fixtures/events?fixture=${id}`, footballServerOptions),
            fetch(`${FOOTBALL_API_URL}/fixtures/statistics?fixture=${id}`, footballServerOptions),
        ]);
        if (eventsRes.ok) match.events = (await eventsRes.json()).response;
        if (statsRes.ok) {
            const statsData = await statsRes.json();
            if (statsData.response && statsData.response.length > 0) {
                const homeStatsRaw = statsData.response.find((s: any) => s.team.id === apiFixture.teams.home.id)?.statistics || [];
                const awayStatsRaw = statsData.response.find((s: any) => s.team.id === apiFixture.teams.away.id)?.statistics || [];
                const processedStats: Record<string, { home: any; away: any; }> = {};
                const allStatTypes = new Set([...homeStatsRaw.map((s: any) => s.type), ...awayStatsRaw.map((s: any) => s.type)]);
                allStatTypes.forEach(type => {
                    const homeValue = homeStatsRaw.find((s: any) => s.type === type)?.value ?? 0;
                    const awayValue = awayStatsRaw.find((s: any) => s.type === type)?.value ?? 0;
                    processedStats[type] = { home: homeValue, away: awayValue };
                });
                match.statistics = processedStats;
            }
        }
        return match;
    } catch (error) { return null; }
});


// ==================================================================
// === HIGHLIGHTS API SECTION (REPLACED WITH YOUTUBE API)         ===
// ==================================================================
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_URL = 'https://www.googleapis.com/youtube/v3/search';

export const getMatchHighlights = cache(async (matchDetails: MatchDetails): Promise<Highlight[]> => {
  // Only search YouTube for finished matches and if the API key is present.
  if (matchDetails.status !== 'FT' || !YOUTUBE_API_KEY) {
    return []; 
  }

  // Build a high-quality search query to get relevant results.
  const homeTeam = matchDetails.homeTeam.name;
  const awayTeam = matchDetails.awayTeam.name;
  const year = new Date(matchDetails.fixture.date).getFullYear(); 
  const searchQuery = `${homeTeam} vs ${awayTeam} ${year} highlights`;

  const params = new URLSearchParams({
    part: 'snippet',
    q: searchQuery,
    key: YOUTUBE_API_KEY,
    type: 'video',
    maxResults: '5',
    videoEmbeddable: 'true',
  });

  const url = `${YOUTUBE_API_URL}?${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 * 24 } // Cache results for 24 hours
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[YouTube API] Error:', errorData.error.message);
      return [];
    }

    const result = await response.json();
    
    // Map the YouTube API response to our app's internal `Highlight` type.
    if (result.items && result.items.length > 0) {
      return result.items.map((item: any): Highlight => ({
        id: item.id.videoId,
        title: item.snippet.title,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      }));
    }

    return []; // Return an empty array if YouTube's search finds nothing.

  } catch (error) {
    console.error('[YouTube API] A critical fetch error occurred:', error);
    return [];
  }
});


export const fetchMatchLineups = cache(async (fixtureId: string): Promise<MatchLineupData | null> => {
  if (!FOOTBALL_API_KEY) return null;

  try {
    const response = await fetch(`${FOOTBALL_API_URL}/fixtures/lineups?fixture=${fixtureId}`, footballServerOptions);
    if (!response.ok) return null;
    
    const data = await response.json();
    if (!data.response || data.response.length < 2) {
      return null; // We need lineups for both teams
    }

    const homeLineupData = data.response[0];
    const awayLineupData = data.response[1];

    const processLineup = (lineupData: any): Lineup => {
      return {
        team: {
          id: lineupData.team.id,
          name: lineupData.team.name,
          logo: lineupData.team.logo,
        },
        formation: lineupData.formation,
        startXI: lineupData.startXI.map((p: any) => p.player),
        substitutes: lineupData.substitutes.map((p: any) => p.player),
      };
    };

    const lineups: MatchLineupData = {
      home: processLineup(homeLineupData),
      away: processLineup(awayLineupData),
    };

    return lineups;
  } catch (error) {
    console.error(`Error fetching lineups for fixture ${fixtureId}:`, error);
    return null;
  }
});


// ==================================================================
// === SIMPLIFIED DATA FETCHING FOR HIGHLIGHTS PAGE               ===
// ==================================================================
export interface DailyPageData {
  liveWithStreams: any[];
  upcomingMatches: any[];
  finishedWithHighlights: { match: Match; highlight: Highlight }[];
}

export const fetchDailyMatchesAndHighlights = async (date: string): Promise<DailyPageData> => {
  await dbConnect();

  const fixturesResponse = await fetch(`${FOOTBALL_API_URL}/fixtures?date=${date}`, footballServerOptions);
  
  const defaultResponse = {
    liveWithStreams: [],
    upcomingMatches: [],
    finishedWithHighlights: [],
  };

  if (!fixturesResponse.ok) return defaultResponse;
  
  const fixturesData = await fixturesResponse.json();
  const allFixtures: ApiFixture[] = (fixturesData.response || []).filter((f: any) => mapStatus(f.fixture.status).status === 'FT');

  if (allFixtures.length === 0) return defaultResponse;

  const finishedMatches = allFixtures.map(f => ({ match: mapApiFixtureToMatch(f)!, fixture: f.fixture }));
  const matchIds = finishedMatches.map(m => m.match.id);

  // 1. Find all highlights that are ALREADY in the database in one go.
  const highlightsFromDb = await HighlightModel.find({ matchId: { $in: matchIds } });
  const dbMatchIds = new Set(highlightsFromDb.map(h => h.matchId));

  const resultsFromDb = highlightsFromDb.map(dbHighlight => ({
    match: {
      id: dbHighlight.matchId,
      homeTeam: { name: dbHighlight.homeTeamName, logo: dbHighlight.homeTeamLogo },
      awayTeam: { name: dbHighlight.awayTeamName, logo: dbHighlight.awayTeamLogo },
      score: dbHighlight.score,
      league: { name: dbHighlight.leagueName, logo: dbHighlight.leagueLogo, id: 0, country: '', flag: '' },
      status: 'FT', time: 'FT'
    },
    highlight: {
      id: dbHighlight.highlightId,
      title: dbHighlight.highlightTitle,
      embedUrl: dbHighlight.highlightEmbedUrl
    }
  }));
  console.log(`[DB] Found ${resultsFromDb.length} highlights in MongoDB.`);

  // 2. Identify which matches are NOT in the database and need fetching from the API.
  const matchesToFetch = finishedMatches.filter(m => !dbMatchIds.has(m.match.id));
  console.log(`[API] Need to fetch highlights for ${matchesToFetch.length} matches from YouTube.`);

  // 3. Fetch all missing highlights from the YouTube API in parallel.
  const apiPromises = matchesToFetch.map(async ({ match, fixture }) => {
    const highlights = await getMatchHighlights({ ...match, fixture });
    if (highlights && highlights.length > 0) {
      const firstHighlight = highlights[0];
      // Save the new highlight to the DB
      new HighlightModel({
          matchId: match.id, matchDate: new Date(fixture.date),
          homeTeamName: match.homeTeam.name, homeTeamLogo: match.homeTeam.logo,
          awayTeamName: match.awayTeam.name, awayTeamLogo: match.awayTeam.logo,
          score: match.score, leagueName: match.league.name, leagueLogo: match.league.logo,
          highlightId: firstHighlight.id, highlightTitle: firstHighlight.title,
          highlightEmbedUrl: firstHighlight.embedUrl,
      }).save().catch(e => console.error(`[DB Save Error] ${e.message}`)); // Save and forget

      return { match, highlight: firstHighlight };
    }
    return null;
  });

  const resultsFromApi = (await Promise.all(apiPromises)).filter(Boolean) as { match: Match; highlight: Highlight }[];

  // 4. Combine results from the database and the API.
  return {
    liveWithStreams: [],
    upcomingMatches: [],
    finishedWithHighlights: [...resultsFromDb, ...resultsFromApi],
  };
};

// The functions 'fetchLiveMatches', 'searchForLiveStream', and 'getLiveStreamForMatch' have been removed
// as they are no longer required for the highlights-only page.