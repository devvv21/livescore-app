import Image from 'next/image';
import { notFound } from 'next/navigation';
import { fetchPlayerDetails } from '@/lib/api'; 
import Header from '@/components/Header';
import SportsNav from '@/components/SportsNav';
import Footer from '@/components/Footer';
import { ShieldCheck, Target, Footprints, Clock, Star, Globe } from 'lucide-react';
import { Metadata } from 'next';
import { PlayerDetails } from '@/lib/api';

// Define a type for the page props
interface PlayerProfilePageProps {
  params: {
    // Add slug here to match the folder structure
    slug: string; 
    id: string;
  };
}

// Helper function to create URL-friendly slugs from strings
const slugify = (text: string | undefined | null): string => {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')       // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word characters except hyphens
    .replace(/\-\-+/g, '-');      // Replace multiple hyphens with a single one
};

// --- DYNAMIC METADATA FUNCTION ---
export async function generateMetadata({ params }: PlayerProfilePageProps): Promise<Metadata> {
  const player = await fetchPlayerDetails(params.id);

  if (!player) {
    return { title: "Player Not Found" };
  }

  const title = `${player.name}: Stats, Goals & Profile - ${player.team.name}`;
  const description = `View the full player profile for ${player.name}. Get live stats, goals, assists, minutes played, and more for the ${player.league.name} season.`;
  const keywords = [
    player.name, `${player.name} stats`, `${player.name} goals`,
    player.team.name, player.league.name, player.nationality,
    'football player stats', 'live scores',
  ];
  
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://todaylivescores.com';
  
  // Get the slug from the params for the URL.
  // We use the page's actual slug parameter instead of re-generating it.
  const teamSlug = params.slug; 

  // --- FIX APPLIED HERE ---
  // The "/player/" segment is now correctly included in the path.
  const path = `teams-list/${teamSlug}/player/${player.id}`;
  const canonicalUrl = `${baseUrl}${path.replace(/\/\//g, '/')}`;

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'TodayLiveScores' }],
    publisher: 'TodayLiveScores',
    alternates: {
      canonical: canonicalUrl, // Use the corrected URL
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl, // Use the corrected URL
      siteName: 'TodayLiveScores',
      images: [{ url: player.photo, width: 256, height: 256, alt: `Photo of ${player.name}` }],
      locale: 'en_US',
      type: 'profile',
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: [player.photo],
    },
  };
}

// Helper component for displaying a stat
const StatItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | number | null }) => (
  <div className="flex flex-col items-center justify-center bg-[#2b3341] p-4 rounded-lg text-center">
    <Icon className="w-8 h-8 text-teal-400 mb-2" />
    <span className="text-sm text-gray-400">{label}</span>
    <span className="text-2xl font-bold text-white">{value ?? 'N/A'}</span>
  </div>
);

export default async function PlayerProfilePage({ params }: PlayerProfilePageProps) {
  const { id } = params;
  const player = await fetchPlayerDetails(id);

  if (!player) {
    notFound();
  }

  return (
    <div className="bg-[#1d222d] text-gray-200 min-h-screen">
      <Header />
      <SportsNav />
      <div className="container mx-auto px-4 py-6">
        <div className="lg:flex lg:gap-6">
          <main className="w-full lg:flex-1 lg:order-2 lg:min-w-0">
            <div className="bg-[#1f2632] rounded-lg shadow-lg overflow-hidden">
              <div className="bg-[#2b3341] p-6 md:flex md:items-center md:gap-6">
                <div className="relative w-32 h-32 mx-auto md:mx-0 mb-4 md:mb-0 flex-shrink-0">
                  <Image
                    src={player.photo}
                    alt={player.name}
                    fill
                    sizes="128px"
                    className="rounded-full border-4 border-teal-400 object-cover"
                    priority={true}
                  />
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-4xl font-bold text-white">{player.name}</h1>
                  <div className="flex items-center justify-center md:justify-start gap-4 mt-2">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Image src={player.team.logo} alt={player.team.name} width={24} height={24} />
                      <span>{player.team.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Globe className="w-5 h-5" />
                      <span>{player.nationality}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatItem icon={Footprints} label="Appearances" value={player.games.appearences} />
                <StatItem icon={Target} label="Goals" value={player.statistics.goals} />
                <StatItem icon={ShieldCheck} label="Assists" value={player.statistics.assists} />
                <StatItem icon={Clock} label="Minutes" value={player.games.minutes} />
                <StatItem icon={Star} label="Rating" value={player.games.rating} />
              </div>
              
              <div className="p-6 border-t border-gray-700">
                  <h3 className="text-xl font-bold text-white mb-4">Player Info</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-[#2b3341] p-3 rounded-md"><strong>Position:</strong> <span className="text-gray-300">{player.games.position}</span></div>
                      <div className="bg-[#2b3341] p-3 rounded-md"><strong>Age:</strong> <span className="text-gray-300">{player.age}</span></div>
                      <div className="bg-[#2b3341] p-3 rounded-md"><strong>Height:</strong> <span className="text-gray-300">{player.height}</span></div>
                      <div className="bg-[#2b3341] p-3 rounded-md"><strong>Weight:</strong> <span className="text-gray-300">{player.weight}</span></div>
                  </div>
              </div>
            </div>
          </main>

          <aside className="hidden lg:block lg:w-72 lg:order-3 flex-shrink-0 lg:sticky lg:top-4 lg:self-start">
            <div className="bg-[#2b3341] rounded-lg p-4 shadow-lg">
              <h3 className="text-lg font-bold text-white mb-4">League Info</h3>
                <div className="flex items-center gap-3">
                  <Image src={player.league.logo} alt={player.league.name} width={40} height={40} />
                  <div>
                    <p className="font-semibold text-white">{player.league.name}</p>
                    <p className="text-sm text-gray-400">{player.league.country}</p>
                  </div>
                </div>
            </div>
          </aside>
        </div>
      </div>
      <Footer />
    </div>
  );
}