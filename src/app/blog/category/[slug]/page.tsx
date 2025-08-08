// src/app/blog/category/[slug]/page.tsx

import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { IPost, ICategory, ITag } from '@/models/Post';
import dbConnect from '@/lib/mongodb';
import Post from '@/models/Post';
import Category from '@/models/Category';
import Tag from '@/models/Tag';
import Header from '@/components/Header';
import SportsNav from '@/components/SportsNav';
import Footer from '@/components/Footer';
import BackButton from '@/components/BackButton';
import BlogPagination from '@/components/BlogPagination';
import FormattedDate from '@/components/FormattedDate';
import { fetchNewsList } from '@/lib/news-api';
import { NewsArticleSummary } from '@/lib/types';
import { createTagSlug, createCategorySlug, getCategoryNameFromSlug } from '@/lib/utils';

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

const PostCard = ({ post }: { post: IPost }) => {
  const summary = post.content?.blocks?.find(b => b.type === 'paragraph')?.data.text.replace(/<[^>]*>/g, '').slice(0, 100) + '...' || 'Click to read more.';
  const imageUrl = `https://todaylivescores.com${post.featuredImageUrl || '/placeholder-image.jpg'}`;

  return (
    <div className="bg-[#283040] rounded-lg overflow-hidden shadow-lg flex flex-col hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <Link href={`/blog/${post.slug}`} className="block group">
        <div className="relative w-full h-48">
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
        <h2 className="text-xl font-bold text-white mb-2 flex-grow">
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

const Sidebar = ({ categories, tags, latestNews }: { categories: ICategory[], tags: ITag[], latestNews: NewsArticleSummary[] }) => (
  <aside className="lg:col-span-3">
    <div className="sticky top-24 space-y-8">
      <div className="p-4 bg-[#283040] rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">Categories</h3>
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat._id.toString()}>
              <Link href={`/blog/category/${createCategorySlug(cat.name)}`} className="text-gray-300 hover:text-blue-400 transition-colors block capitalize">
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-4 bg-[#283040] rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">Tags</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <Link key={tag._id.toString()} href={`/blog/tag/${createTagSlug(tag.name)}`} className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-gray-600 transition-colors">
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
    </div>
  </aside>
);

async function getCategoryData(categorySlug: string, { page = 1, limit = 6 }: { page: number; limit: number }) {
  const categoryName = getCategoryNameFromSlug(categorySlug);
  const skip = (page - 1) * limit;

  await dbConnect();
  const category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } }).lean();
  if (!category) return null;

  const [posts, totalPosts, allCategories, allTags, allNews] = await Promise.all([
    Post.find({ categories: category._id }).sort({ createdAt: -1 }).skip(skip).limit(limit).populate('categories', 'name').lean(),
    Post.countDocuments({ categories: category._id }),
    Category.find({}).sort({ name: 1 }).lean(),
    Tag.find({}).sort({ name: 1 }).lean(),
    fetchNewsList()
  ]);

  const latestNews = allNews.slice(0, 3);

  return {
    category: JSON.parse(JSON.stringify(category)),
    posts: JSON.parse(JSON.stringify(posts)),
    allCategories: JSON.parse(JSON.stringify(allCategories)),
    allTags: JSON.parse(JSON.stringify(allTags)),
    totalPages: Math.ceil(totalPosts / limit),
    currentPage: page,
    latestNews: JSON.parse(JSON.stringify(latestNews))
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const data = await getCategoryData(params.slug, { page: 1, limit: 1 });
    const categoryName = data?.category.name ? `${data.category.name.charAt(0).toUpperCase()}${data.category.name.slice(1)}` : 'Category';
    const canonicalUrl = `https://todaylivescores.com/blog/category/${params.slug}`;
  
    return {
      title: `Posts in: ${categoryName} | TLiveScores`,
      description: `Browse all articles filed under the category: ${categoryName}.`,
      alternates: { canonical: canonicalUrl },
      openGraph: {
          title: `Posts in: ${categoryName}`,
          description: `Browse all articles under the ${categoryName} category.`,
          url: canonicalUrl,
      },
    };
  }

export default async function CategoryArchivePage({ params, searchParams }: { params: { slug: string }, searchParams?: { [key: string]: string | string[] | undefined } }) {
  const currentPage = Number(searchParams?.page) || 1;
  const postsPerPage = 6;
  
  const data = await getCategoryData(params.slug, { page: currentPage, limit: postsPerPage });

  if (!data) {
    notFound();
  }

  const { category, posts, allCategories, allTags, totalPages, latestNews } = data;
  const basePath = `/blog/category/${params.slug}`;

  return (
    <div className="bg-[#1d222d] text-white min-h-screen">
      <Header />
      <SportsNav />
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
            <BackButton href="/blog" text="← Back to All Blogs" />
        </div>
        <div className="text-center mb-12">
          <p className="text-blue-400 font-semibold uppercase tracking-wider">Category</p>
          <h1 className="text-4xl md:text-5xl font-extrabold capitalize">{category.name}</h1>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 lg:gap-8">
          <main className="lg:col-span-9">
            {posts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {posts.map((post) => (<PostCard key={post._id.toString()} post={post} />))}
                </div>
                <BlogPagination currentPage={currentPage} totalPages={totalPages} basePath={basePath} />
              </>
            ) : (
              <div className="text-center py-20 bg-[#283040] rounded-lg">
                <p className="text-gray-400 text-lg">No posts found in this category yet.</p>
              </div>
            )}
          </main>
          <Sidebar categories={allCategories} tags={allTags} latestNews={latestNews} />
        </div>
      </div>
      <Footer />
    </div>
  );
}