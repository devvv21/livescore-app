'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IPost, ICategory, ITag, IContentBlock } from '@/models/Post';
import BackToBlogs from '@/components/BackToBlogs';
import FormattedDate from '@/components/FormattedDate';
import RelatedPosts from '@/components/RelatedPosts';

const TableOfContents = ({ contentBlocks }: { contentBlocks?: IContentBlock[] | null }) => {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return null;

  const headings = contentBlocks
    .filter(block => block.type === 'header' && block.data?.text && [2, 3].includes(block.data.level))
    .map(block => ({
      level: block.data.level,
      text: block.data.text,
      slug: (block.data.text ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    }));

  if (headings.length === 0) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <p className="text-lg font-bold text-white mb-3">Table of Contents</p>
        <p className="text-sm text-gray-400">This article has no sections.</p>
      </div>
    );
  }

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, slug: string) => {
    e.preventDefault();
    document.getElementById(slug)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.history.pushState(null, '', `#${slug}`);
  };

  return (
    <div className="p-4 bg-[#2b3341] rounded-lg border border-gray-700 space-y-4">
      <p className="text-lg font-bold text-white">Table of Contents</p>
      <ul className="space-y-2">
        {headings.map((heading, index) => (
          <li key={index} style={{ marginLeft: `${(heading.level - 2) * 1}rem` }}>
            <a
              href={`#${heading.slug}`}
              onClick={(e) => handleScroll(e, heading.slug)}
              className="text-gray-300 hover:text-red-400 transition-colors text-sm cursor-pointer"
              dangerouslySetInnerHTML={{ __html: heading.text }}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

const PostMeta = ({ categories, tags }: { categories?: ICategory[], tags?: ITag[] }) => {
  const hasCategories = categories && categories.length > 0;
  const hasTags = tags && tags.length > 0;

  if (!hasCategories && !hasTags) {
    return (
      <div className="p-4 bg-[#2b3341] rounded-lg border border-gray-700">
        <p className="text-sm text-gray-400 text-center">No Categories or Tags</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hasCategories && (
        <div className="p-4 bg-[#2b3341] rounded-lg border border-gray-700">
          <p className="text-md font-semibold text-white mb-3 uppercase tracking-wider">Categories</p>
          <div className="flex flex-wrap gap-2">
            {categories.map(cat => (
              <Link key={cat._id.toString()} href={`/blog/category/${encodeURIComponent(cat.name.toLowerCase())}`} className="bg-blue-900/50 text-blue-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-blue-900 transition-colors">
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      )}
      {hasTags && (
        <div className="p-4 bg-[#2b3341] rounded-lg border border-gray-700">
          <p className="text-md font-semibold text-white mb-3 uppercase tracking-wider">Tags</p>
          <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
              <Link key={tag._id.toString()} href={`/blog/tag/${encodeURIComponent(tag.name.toLowerCase())}`} className="bg-gray-700 text-gray-300 text-xs font-medium px-3 py-1 rounded-full hover:bg-gray-600 transition-colors">
                #{tag.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const ListItemRenderer = ({ item }: { item: { content: string, items: any[] } }) => {
  return (
    <li>
      <span dangerouslySetInnerHTML={{ __html: item.content }} />
      {item.items && item.items.length > 0 && (
        <ul className="list-disc pl-5 space-y-2 my-2">
          {item.items.map((subItem, index) => (
            <ListItemRenderer key={index} item={subItem} />
          ))}
        </ul>
      )}
    </li>
  );
};

const PostRenderer = ({ contentBlocks }: { contentBlocks?: IContentBlock[] | null }) => {
  if (!contentBlocks || !Array.isArray(contentBlocks)) return null;
  const publicDomain = 'https://todaylivescores.com';

  return (
    <div className="prose prose-invert max-w-none prose-p:text-gray-300 prose-headings:text-white prose-a:text-red-500 hover:prose-a:text-red-400 transition-colors">
      {contentBlocks.map((block) => {
        const id = block.type === 'header' ? (block.data.text ?? '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '') : block.id;
        switch (block.type) {
          case 'header':
            const { level, text } = block.data;
            if (!text || !level || level === 1) return null;
            if (level === 2) return <h2 key={block.id} id={id} className="text-3xl font-bold mt-10 mb-4" dangerouslySetInnerHTML={{ __html: text }} />;
            if (level === 3) return <h3 key={block.id} id={id} className="text-2xl font-semibold mt-8 mb-3" dangerouslySetInnerHTML={{ __html: text }} />;
            return null;
          case 'paragraph':
            return <div key={block.id} className="text-lg leading-relaxed mb-6" dangerouslySetInnerHTML={{ __html: block.data.text }} />;
          case 'image':
            const imageUrl = block.data.file.url.startsWith('http') ? block.data.file.url : `${publicDomain}${block.data.file.url}`;
            return (
              <figure key={block.id} className="my-8">
                <Image src={imageUrl} alt={block.data.caption ?? 'Blog image'} width={800} height={450} className="rounded-lg w-full h-auto object-cover" />
                <figcaption className="text-center text-sm text-gray-400 mt-2">{block.data.caption}</figcaption>
              </figure>
            );
          case 'list':
            const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
            const listStyle = block.data.style === 'ordered' ? 'list-decimal' : 'list-disc';
            return (
              <ListTag key={block.id} className={`${listStyle} pl-5 space-y-2 my-4 mb-6`}>
                {block.data.items.map((item: any, index: number) => (<ListItemRenderer key={index} item={item} />))}
              </ListTag>
            );
          case 'table':
            return (
              <div key={block.id} className="my-6 mb-8 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  {block.data.withHeadings && (
                    <thead>
                      <tr className="bg-gray-700/50">
                        {block.data.content[0].map((cellContent: string, cellIndex: number) => (
                          <th key={cellIndex} className="p-3 border border-gray-600 font-semibold" dangerouslySetInnerHTML={{ __html: cellContent }} />
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody className="align-baseline">
                    {(block.data.withHeadings ? block.data.content.slice(1) : block.data.content).map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className="bg-gray-800 even:bg-gray-700/20">
                        {row.map((cellContent: string, cellIndex: number) => (
                          <td key={cellIndex} className="p-3 border border-gray-600" dangerouslySetInnerHTML={{ __html: cellContent }} />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default function BlogPostLayout({ post, relatedPosts }: { post: IPost; relatedPosts: IPost[] }) {
  const categories = (post.categories as ICategory[]) || [];
  const tags = (post.tags as ITag[]) || [];
  const publicDomain = 'https://todaylivescores.com';

  const featuredImageUrl = post.featuredImageUrl
    ? post.featuredImageUrl.startsWith('http')
      ? post.featuredImageUrl
      : `${publicDomain}${post.featuredImageUrl}`
    : null;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-12 lg:gap-12">
        <aside className="hidden lg:block lg:col-span-3">
          <div className="sticky top-24 space-y-6">
            <TableOfContents contentBlocks={post.content?.blocks} />
          </div>
        </aside>
        <main className="lg:col-span-6">
          <BackToBlogs />
          <article>
            <header className="mb-8">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{post.title}</h1>
              <p className="mt-4 text-gray-400">By {post.author || 'Anonymous'} on <FormattedDate dateString={post.createdAt} /></p>
            </header>
            {featuredImageUrl && (
              <div className="relative w-full h-64 md:h-96 mb-8 rounded-xl overflow-hidden shadow-lg">
                <Image src={featuredImageUrl} alt={post.title} fill className="object-cover" priority />
              </div>
            )}
            <PostRenderer contentBlocks={post.content?.blocks} />
          </article>
        </main>
        <aside className="lg:col-span-3 mt-12 lg:mt-0">
          <div className="sticky top-24 space-y-6">
            <PostMeta categories={categories} tags={tags} />
            <RelatedPosts posts={relatedPosts} />
          </div>
        </aside>
      </div>
    </div>
  );
}