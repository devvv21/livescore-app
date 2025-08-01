'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IPost } from '@/models/Post';
import FormattedDate from '@/components/FormattedDate';

// A small card for each individual related post
const RelatedPostCard = ({ post }: { post: IPost }) => {
  // Use a public domain for image URLs and provide a placeholder
  const imageUrl = post.featuredImageUrl
    ? (post.featuredImageUrl.startsWith('http') ? post.featuredImageUrl : `https://todaylivescores.com${post.featuredImageUrl}`)
    : '/placeholder-image.jpg';

  return (
    <Link href={`/blog/${post.slug}`} className="group flex items-start gap-4">
      <div className="relative w-20 h-16 flex-shrink-0">
        <Image
          src={imageUrl}
          alt={post.title}
          fill
          className="rounded-md object-cover"
          sizes="80px"
        />
      </div>
      <div className="flex-grow">
        <h4 className="text-sm font-semibold text-white leading-tight group-hover:text-blue-400 transition-colors">
          {post.title}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          <FormattedDate dateString={post.createdAt} />
        </p>
      </div>
    </Link>
  );
};

// The main component that displays the list of related posts
const RelatedPosts = ({ posts }: { posts: IPost[] }) => {
  // Don't render anything if there are no posts to display
  if (!posts || posts.length === 0) {
    return null;
  }

  return (
    <div className="p-4 bg-[#2b3341] rounded-lg border border-gray-700">
      <h3 className="text-md font-semibold text-white mb-4 uppercase tracking-wider">
        You Might Also Like
      </h3>
      <div className="space-y-4">
        {posts.map(post => (
          <RelatedPostCard key={post._id.toString()} post={post} />
        ))}
      </div>
    </div>
  );
};

export default RelatedPosts;