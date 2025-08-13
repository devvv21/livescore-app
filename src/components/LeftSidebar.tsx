'use client';

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Player, NewsArticleSummary } from "@/lib/types";
import { Carousel } from "./Carousel";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import { createTeamSlug } from "@/lib/utils";

type PlayerOfWeek = Player & { rating?: number | string; teamId?: number; teamName?: string; photo?: string };

type LeftSidebarProps = {
  teamOfTheWeek: PlayerOfWeek[];
  latestNews: NewsArticleSummary[];
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "Date unavailable";
  const d = new Date(dateString);
  return Number.isNaN(d.getTime())
    ? "Invalid Date"
    : d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const normalize = (src?: string | null) => {
  if (!src) return "";
  const s = src.trim();
  if (!s) return "";
  if (s.startsWith("//")) return `https:${s}`;
  return s;
};

const initials = (name?: string | null) => {
  if (!name) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const playerPhotoSrc = (p: PlayerOfWeek) => {
  const candidates = [p.playerPhoto as any, p.photo as any, (p as any)?.player?.photo as any];
  for (const c of candidates) {
    const n = normalize(c);
    if (n) return n;
  }
  if (p.id) return `https://media.api-sports.io/football/players/${p.id}.png`;
  return "";
};

function Avatar({ player, size = 32 }: { player: PlayerOfWeek; size?: number }) {
  const [err, setErr] = useState(false);
  const src = playerPhotoSrc(player);
  if (err || !src) {
    return (
      <div
        className="rounded-full bg-gray-600 text-white flex items-center justify-center select-none"
        style={{ width: size, height: size, fontSize: Math.max(10, Math.floor(size * 0.45)) }}
        aria-label={player.name}
      >
        {initials(player.name)}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={player.name}
      width={size}
      height={size}
      className="rounded-full bg-gray-600 object-cover"
      onError={() => setErr(true)}
      loading="lazy"
      unoptimized
    />
  );
}

export default function LeftSidebar({ teamOfTheWeek, latestNews }: LeftSidebarProps) {
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const teamForDisplay = useMemo(() => (Array.isArray(teamOfTheWeek) ? teamOfTheWeek.slice(0, 5) : []), [teamOfTheWeek]);
  const newsForDisplay = useMemo(() => (Array.isArray(latestNews) ? latestNews.slice(0, 5) : []), [latestNews]);

  return (
    <aside className="space-y-6">
      <div className="bg-[#2b3341] rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Player of the Week</h3>
        {teamForDisplay.length > 0 ? (
          isMobile ? (
            <Carousel options={{ loop: true }}>
              {teamForDisplay.map((player) => {
                const n = typeof player.rating === "string" ? parseFloat(player.rating) : Number(player.rating);
                const rating = Number.isFinite(n) ? n.toFixed(1) : "-";
                const href =
                  player.teamName && player.teamId
                    ? `/teams-list/${createTeamSlug(player.teamName, player.teamId)}/player/${player.id}`
                    : `/player/${player.id}`;
                return (
                  <Link key={player.id} href={href} className="flex items-center justify-between gap-3 flex-[0_0_100%] group">
                    <div className="flex items-center gap-3">
                      <Avatar player={player} />
                      <span className="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">
                        {player.name}
                      </span>
                    </div>
                    <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">{rating}</span>
                  </Link>
                );
              })}
            </Carousel>
          ) : (
            <ul className="space-y-2">
              {teamForDisplay.map((player) => {
                const n = typeof player.rating === "string" ? parseFloat(player.rating) : Number(player.rating);
                const rating = Number.isFinite(n) ? n.toFixed(1) : "-";
                const href =
                  player.teamName && player.teamId
                    ? `/teams-list/${createTeamSlug(player.teamName, player.teamId)}/player/${player.id}`
                    : `/player/${player.id}`;
                return (
                  <li key={player.id}>
                    <Link
                      href={href}
                      className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-gray-700/50 group transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar player={player} />
                        <span className="font-medium text-sm text-white group-hover:text-blue-400 transition-colors">
                          {player.name}
                        </span>
                      </div>
                      <span className="bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">{rating}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">Player of the Week data is unavailable.</p>
        )}
      </div>

      <div className="bg-[#2b3341] rounded-lg p-4 shadow-lg">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">Latest News</h3>
        {newsForDisplay.length > 0 ? (
          isMobile ? (
            <Carousel options={{ loop: true }}>
              {newsForDisplay.map((article) => (
                <Link
                  key={(article as any).id || article.slug}
                  href={`/news/${article.slug}`}
                  className="flex items-start gap-3 group flex-[0_0_100%]"
                >
                  <div className="relative w-24 h-16 flex-shrink-0">
                    <Image
                      src={normalize(article.image_url) || "/placeholder-image.jpg"}
                      alt={article.title}
                      fill
                      sizes="100px"
                      className="rounded-md object-cover"
                      onError={(e) => {
                        const el = e.target as HTMLImageElement;
                        el.src = "/placeholder-image.jpg";
                      }}
                      loading="lazy"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-teal-400 text-xs font-semibold mb-1 uppercase">
                      {article.keywords?.split(",")[0] || "News"}
                    </p>
                    <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors leading-tight">
                      {article.title}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">{formatDate(article.publishedAt)}</p>
                  </div>
                </Link>
              ))}
            </Carousel>
          ) : (
            <ul className="space-y-4">
              {newsForDisplay.map((article) => (
                <li key={(article as any).id || article.slug}>
                  <Link href={`/news/${article.slug}`} className="flex items-start gap-3 group">
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <Image
                        src={normalize(article.image_url) || "/placeholder-image.jpg"}
                        alt={article.title}
                        fill
                        sizes="100px"
                        className="rounded-md object-cover"
                        onError={(e) => {
                          const el = e.target as HTMLImageElement;
                          el.src = "/placeholder-image.jpg";
                        }}
                        loading="lazy"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-teal-400 text-xs font-semibold mb-1 uppercase">
                        {article.keywords?.split(",")[0] || "News"}
                      </p>
                      <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors leading-tight">
                        {article.title}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">{formatDate(article.publishedAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">No recent news available.</p>
        )}
      </div>
    </aside>
  );
}
