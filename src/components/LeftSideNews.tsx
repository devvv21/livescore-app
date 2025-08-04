'use client';

import Image from "next/image";
import Link from "next/link";
import { Player } from "@/lib/types"; 
import { IPost } from "@/models/Post";
import { Carousel } from "./Carousel"; 
import RelatedPosts from "@/components/RelatedPosts";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { createTeamSlug } from "@/lib/utils";

interface LeftSideNewsProps {
  teamOfTheWeek: Player[];
  posts: IPost[];
}

const LeftSideNews = ({ teamOfTheWeek, posts }: LeftSideNewsProps) => {
  const isMobile = useMediaQuery('(max-width: 1023px)');
  const teamForDisplay = Array.isArray(teamOfTheWeek) ? teamOfTheWeek.slice(0, 5) : [];
  const postsForDisplay = Array.isArray(posts) ? posts.slice(0, 3) : [];

  return (
    <aside className="space-y-6">
      
      <div className="bg-[#2b3341] rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">
          Player of the Week
        </h3>
        {teamForDisplay.length > 0 ? (
          isMobile ? (
            <Carousel options={{ loop: true }}>
              {teamForDisplay.map((player) => (
                <Link 
                  href={`/teams-list/${createTeamSlug(player.teamName, player.teamId)}/player/${player.id}`} 
                  key={player.id} 
                  className="flex items-center justify-between gap-3 flex-[0_0_100%] group"
                >
                  <div className="flex items-center gap-3">
                    <Image src={player.logo} alt={`${player.teamName} logo`} width={32} height={32} className="rounded-full bg-gray-600 object-cover"/>
                    <span className="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">{player.name}</span>
                  </div>
                  <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">{parseFloat(player.rating).toFixed(1)}</span>
                </Link>
              ))}
            </Carousel>
          ) : (
            <ul className="space-y-2">
              {teamForDisplay.map((player) => (
                <li key={player.id}>
                   <Link 
                     href={`/teams-list/${createTeamSlug(player.teamName, player.teamId)}/player/${player.id}`} 
                     className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-700/50 group transition-colors"
                   >
                      <div className="flex items-center gap-3">
                        <Image src={player.logo} alt={`${player.teamName} logo`} width={32} height={32} className="rounded-full bg-gray-600 object-cover"/>
                        <span className="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">{player.name}</span>
                      </div>
                      <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">{parseFloat(player.rating).toFixed(1)}</span>
                   </Link>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">Player of the Week data is unavailable.</p>
        )}
      </div>

      <RelatedPosts posts={postsForDisplay} />

    </aside>
  );
};

export default LeftSideNews;