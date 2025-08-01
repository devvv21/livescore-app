import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import Header from '@/components/Header';
import SportsNav from '@/components/SportsNav';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import BlogPagination from '@/components/BlogPagination';
import { IPost, ICategory, ITag } from '@/models/Post';
import FormattedDate from '@/components/FormattedDate';
import { fetchNewsList } from '@/lib/news-api';
import { NewsArticleSummary } from '@/lib/types';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Latest Sports News & Analysis | TLiveScores Blog',
  description: 'Explore in-depth articles, match previews, and expert analysis on football, basketball, boxing, and more.',
  alternates: { canonical: 'https://todaylivescores.com/blog' },
};

const formatDateForNews = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date unavailable';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

async function getBlogPageData({ page = 1, limit = 6 }: { page: number; limit: number }) {
  await dbConnect();
  const skip = (page - 1) * limit;

  const [posts, categories, tags, totalPosts, allNews] = await Promise.all([
    Post.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('categories', 'name').lean(),
    Category.find({}).sort({ name: 1 }).lean(),
    Tag.find({}).sort({ name: 1 }).lean(),
    Post.countDocuments(),
    fetchNewsList(),
  ]);

  const latestNews = allNews.slice(0, 3);

  return {
    posts: JSON.parse(JSON.stringify(posts)),
    categories: JSON.parse(JSON.stringify(categories)),
    tags: JSON.parse(JSON.stringify(tags)),
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
    latestNews: JSON.parse(JSON.stringify(latestNews)),
  };
}

const PostCard = ({ post }: { post: IPost }) => {
  const summary = post.content?.blocks?.find(b => b.type === 'paragraph')?.data.text.replace(/<[^>]*>/g, '').slice(0, 90) + '...' || 'Read more...';
  const firstCategory = post.categories?.[0] as ICategory | undefined;
  const imageUrl = `https://todaylivescores.com${post.featuredImageUrl || '/placeholder-image.jpg'}`;

  return (
    <div className="bg-[#283040] rounded-lg overflow-hidden shadow-lg flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className="relative w-full h-48">
          {firstCategory && (
            <div className="absolute top-3 left-3 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 capitalize">
              {firstCategory.name}
            </div>
          )}
          <Image
            src={imageUrl}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      <div className="p-5 flex flex-col flex-grow">
        <h2 className="text-lg font-bold text-white mb-2 flex-grow">
          <Link href={`/blog/${post.slug}`} className="hover:text-blue-400 transition-colors">
            {post.title}
          </Link>
        </h2>
        <p className="text-gray-400 text-sm mb-4">{summary}</p>
        <div className="text-xs text-gray-500 border-t border-gray-700 pt-3 mt-auto">
          <span>By {post.author || 'Staff'}</span>
          <span className="mx-2">•</span>
          <FormattedDate dateString={post.createdAt} />
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ categories, tags, latestNews }: { categories: ICategory[]; tags: ITag[]; latestNews: NewsArticleSummary[] }) => (
  <aside className="lg:col-span-3 space-y-8 sticky top-24">
    <div className="p-4 bg-[#283040] rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Categories</h3>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat._id.toString()}>
            <Link href={`/blog/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-300 hover:text-blue-400 block capitalize">
              {cat.name}
            </Link>
          </li>
        ))}
      </ul>
    </div>
    <div className="p-4 bg-[#283040] rounded-lg border border-gray-700">
      <h3 className="text-lg font-bold text-white mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map(tag => (
          <Link key={tag._id.toString()} href={`/blog/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-600">
            #{tag.name}
          </Link>
        ))}
      </div>
    </div>
    <div className="p-4 bg-[#283040] rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-700 pb-2">
          Latest News
        </h3>
        {latestNews.length > 0 ? (
            <ul className="space-y-4">
              {latestNews.map((article) => (
                <li key={article.id || article.slug}>
                  <Link href={`/news/${article.slug}`} className="flex items-start gap-3 group">
                    <div className="relative w-24 h-16 flex-shrink-0">
                      <Image src={article.image_url || '/placeholder-image.jpg'} alt={article.title} fill sizes="100px" className="rounded-md object-cover"/>
                    </div>
                    <div className="flex-1">
                      <p className="text-teal-400 text-xs font-semibold mb-1 uppercase">{article.keywords?.split(',')[0] || 'News'}</p>
                      <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors leading-tight">{article.title}</p>
                      <p className="text-gray-400 text-xs mt-1">{formatDateForNews(article.publishedAt)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
        ) : (
          <p className="text-center text-gray-400 py-8 text-sm">No recent news available.</p>
        )}
      </div>
  </aside>
);

export default async function BlogListPage({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const postsPerPage = 6;

  const { posts, categories, tags, totalPages, latestNews } = await getBlogPageData({
    page: currentPage,
    limit: postsPerPage,
  });

  return (
    <div className="bg-[#1d222d] text-white min-h-screen">
      <Header />
      <SportsNav />

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-8">
            <BackButton href="/matches" text="Back to All Matches" />
        </div>
        <h1 className="text-center text-4xl md:text-5xl font-extrabold mb-12">Today Live Scores Blog</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          <main className="lg:col-span-9">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {posts.map(post => (
                    <PostCard key={post._id.toString()} post={post} />
                  ))}
                </div>
                <BlogPagination currentPage={currentPage} totalPages={totalPages} basePath="/blog" />
              </>
            ) : (
              <div className="text-center py-20 bg-[#283040] rounded-lg">
                <p className="text-gray-400 text-lg">No posts found.</p>
                <p className="text-gray-500 mt-2">Check back later for new articles!</p>
              </div>
            )}
          </main>
          <Sidebar categories={categories} tags={tags} latestNews={latestNews} />
        </div>
      </div>
      <Footer />
    </div>
  );
}