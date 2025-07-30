// src/lib/types.ts

// --- EXISTING TYPES (No Changes) ---

// For the news listing page
export const injuryStatuses = [
  'Injured', 
  'Doubt', 
  'Knock', 
  'Disciplinary', 
  'On Loan', 
  'Unavailable'
];

// A plain interface for our injury data structure
export interface IInjuryData {
  _id: any;
  playerId: number;
  playerName: string;
  playerPhoto: string;
  teamId: number;
  teamName: string;
  teamLogo: string;
  status: string;
  details: string;
  returnDate: string;
  lastUpdated: Date | string;
  isApiEntry?: boolean;
}

export interface NewsArticleSummary {
  id: string;
  slug: string;
  title: string;
  description: string;
  image_url: string;
  pubDate: string;
  keywords: string;
  publishedAt: string;
}

// For the detailed news article page
export interface NewsArticleDetail {
  id: string;
  slug: string;
  title: string;
  description: string;
  full_article: string;
  image_url: string;
  pubDate: string;
  creator: string[];
  category: string[];
  country: string[];
  keywords: string[];
  link: string;
  canonical?: string;
}

// For the Table of Contents
export interface Heading {
  id: string;
  text: string;
  level: number;
}

// For Video Highlights
export interface Highlight {
  id: string;
  title: string;
  embedUrl: string;
}

// For Match Lineups
export interface Player {
  id: number;
  name: string;
  number: number;
  pos: string;
  grid: string | null;
}

export interface Lineup {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  formation: string;
  startXI: Player[];
  substitutes: Player[];
}

export interface MatchLineupData {
  home: Lineup;
  away: Lineup;
}

// ==================================================================
// === NEW TYPES THAT WERE MISSING (ADD THESE)                    ===
// ==================================================================

// Defines the shape of a single match object used throughout the app
export interface Match {
  id: number;
  time: string;
  status: 'LIVE' | 'UPCOMING' | 'FT' | 'HT' | string; // Allow other statuses but specify common ones
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  score: string;
  league: {
    id: number;
    name: string;
    logo: string;
    country: string;
    flag: string;
  };
}

// Defines the structure of the data object for the new daily highlights page
export interface DailyPageData {
  liveMatches: Match[];
  upcomingMatches: Match[];
  finishedWithHighlights: { match: Match; highlight: Highlight }[];
}