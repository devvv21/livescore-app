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

const PostCard = ({ post }: { post: IPost }) => {
  const summary = post.content?.blocks?.find(b => b.type === 'paragraph')?.data.text.replace(/<[^>]*>/g, '').slice(0, 100) + '...' || 'Click to read more.';
  const publicDomain = 'https://todaylivescores.com';
  let imageUrl = `${publicDomain}/placeholder-image.jpg`;

  if (post.featuredImageUrl) {
    try {
      const imagePath = new URL(post.featuredImageUrl, publicDomain).pathname;
      imageUrl = `${publicDomain}${imagePath}`;
    } catch (e) {
      console.error("Invalid image URL in PostCard:", post.featuredImageUrl);
    }
  }

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
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ categories, tags }: { categories: ICategory[], tags: ITag[] }) => (
  <aside className="lg:col-span-3">
    <div className="sticky top-24 space-y-8">
      <div className="p-4 bg-[#283040] rounded-lg border border-gray-700">
        <h3 className="text-lg font-bold text-white mb-3">Categories</h3>
        <ul className="space-y-2">
          {categories.map(cat => (
            <li key={cat._id.toString()}>
              <Link href={`/blog/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`} className="text-gray-300 hover:text-blue-400 transition-colors block capitalize">
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
            <Link key={tag._id.toString()} href={`/blog/tag/${tag.name.toLowerCase().replace(/\s+/g, '-')}`} className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-600 transition-colors">
              #{tag.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </aside>
);

async function getCategoryData(categorySlug: string) {
  const categoryName = categorySlug.replace(/-/g, ' ');

  await dbConnect();
  const category = await Category.findOne({ name: { $regex: new RegExp(`^${categoryName}$`, 'i') } }).lean();
  if (!category) return null;

  const [posts, allCategories, allTags] = await Promise.all([
    Post.find({ categories: category._id }).sort({ createdAt: -1 }).populate('categories', 'name').lean(),
    Category.find({}).sort({ name: 1 }).lean(),
    Tag.find({}).sort({ name: 1 }).lean()
  ]);

  return {
    category: JSON.parse(JSON.stringify(category)),
    posts: JSON.parse(JSON.stringify(posts)),
    allCategories: JSON.parse(JSON.stringify(allCategories)),
    allTags: JSON.parse(JSON.stringify(allTags))
  };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getCategoryData(params.slug);
  const categoryName = data?.category.name ? `${data.category.name.charAt(0).toUpperCase()}${data.category.name.slice(1)}` : 'Category';
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}blog/category/${params.slug}`;

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

export default async function CategoryArchivePage({ params }: { params: { slug: string } }) {
  const data = await getCategoryData(params.slug);

  if (!data) {
    notFound();
  }

  const { category, posts, allCategories, allTags } = data;

  return (
    <div className="bg-[#2b3341] text-white min-h-screen">
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
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {posts.map((post) => (<PostCard key={post._id.toString()} post={post} />))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#283040] rounded-lg">
                <p className="text-gray-400 text-lg">No posts found in this category yet.</p>
              </div>
            )}
          </main>
          <Sidebar categories={allCategories} tags={allTags} />
        </div>
      </div>
      <Footer />
    </div>
  );
}