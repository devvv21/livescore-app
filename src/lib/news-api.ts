import { NewsArticleSummary, NewsArticleDetail } from './types';

// The base URL for the new News API
const NEWS_API_BASE_URL = "https://news.todaylivescores.com";

/**
 * This helper function is correct.
 */
function generateSummaryFromHtml(html: string, length = 150): string {
  if (!html) return 'No summary available.';
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

/**
 * CORRECTED: This now maps correctly to your internal NewsArticleSummary type.
 */
function mapApiArticle(apiArticle: any): NewsArticleSummary {
  return {
    id: apiArticle.id.toString(),
    title: apiArticle.title,
    slug: apiArticle.slug,
    image_url: apiArticle.image_url,
    summary: apiArticle.description || generateSummaryFromHtml(apiArticle.full_article),
    publishedAt: apiArticle.created_at,
  };
}

/**
 * ✅ NEW: Proper mapping for full article detail view
 */
function mapApiArticleDetail(apiArticle: any): NewsArticleDetail {
  return {
    id: apiArticle.id.toString(),
    title: apiArticle.title,
    slug: apiArticle.slug,
    full_article: apiArticle.full_article,
    summary: apiArticle.description || generateSummaryFromHtml(apiArticle.full_article),
    image_url: apiArticle.image_url,
    publishedAt: apiArticle.created_at, // ✅ Ensure date is properly mapped
    category: apiArticle.category || [],
    creator: apiArticle.creator || [],
    keywords: apiArticle.keywords || [],
  };
}

/**
 * Fetches the list of news summaries.
 */
export async function fetchNewsList(): Promise<NewsArticleSummary[]> {
  try {
    const res = await fetch(`${NEWS_API_BASE_URL}/api/news`, { cache: 'no-store' });

    if (!res.ok) {
      throw new Error('Failed to fetch news list');
    }

    const apiResponse = await res.json();

    if (!apiResponse || !Array.isArray(apiResponse.data)) {
      console.error("News API response is not in the expected format:", apiResponse);
      return [];
    }

    return apiResponse.data.map(mapApiArticle);

  } catch (error) {
    console.error('API Error (fetchNewsList):', error);
    return [];
  }
}

/**
 * Fetches a single full article by slug.
 */
export async function fetchNewsBySlug(slug: string): Promise<NewsArticleDetail | null> {
  try {
    const res = await fetch(`${NEWS_API_BASE_URL}/api/news/slug/${slug}`, { cache: 'no-store' });

    if (!res.ok) {
      if (res.status === 404) {
        console.error(`Article with slug '${slug}' not found.`);
        return null;
      }
      throw new Error(`Failed to fetch article: ${slug}`);
    }

    const apiResponse = await res.json();

    if (apiResponse && typeof apiResponse === 'object' && apiResponse.slug) {
      return mapApiArticleDetail(apiResponse); // ✅ Mapped version
    } else {
      console.error(`API response for slug '${slug}' was not a valid article object.`);
      return null;
    }

  } catch (error) {
    console.error(`API Error (fetchNewsBySlug for slug: ${slug}):`, error);
    return null;
  }
}
