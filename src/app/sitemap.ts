import { MetadataRoute } from 'next';
import { fetchAllTeamsFromAllLeagues } from '@/lib/api';
import { fetchNewsList } from '@/lib/news-api';
import { createTeamSlug } from '@/lib/utils';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';

export const revalidate = 86400; // Revalidate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Use the consistent environment variable from our previous fix.
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.todaylivescores.com/';

  const [allNews, allLeagues, allPosts] = await Promise.all([
    fetchNewsList().catch(() => []),
    fetchAllTeamsFromAllLeagues().catch(() => []),
    (async () => {
      await dbConnect();
      return Post.find({}).select('slug updatedAt').lean();
    })().catch(() => [])
  ]);

  // FIX #1: Added missing forward slashes to all static URLs
  const staticUrls: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${baseUrl}blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/teams-list`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}highlights`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${baseUrl}predictions`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
  ];

  // Also fixed the missing slash here
  const newsUrls: MetadataRoute.Sitemap = allNews.map(article => ({
    url: `${baseUrl}news/${article.slug}`,
    lastModified: new Date(article.publishedAt || Date.now()),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // FIX #2: Changed the dynamic team page URL structure
  const allTeams = allLeagues.flatMap(league => league.teams);
  const teamUrls: MetadataRoute.Sitemap = allTeams.map(team => ({
    // Changed from /team/ to /teams-list/ to match your new file structure
    url: `${baseUrl}teams-list/${createTeamSlug(team.name, team.id)}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Also fixed the missing slash here
  const blogPostUrls: MetadataRoute.Sitemap = allPosts.map(post => ({
    url: `${baseUrl}blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  // Combine and return all URLs
  return [
    ...staticUrls,
    ...newsUrls,
    ...teamUrls,
    ...blogPostUrls,
  ];
}