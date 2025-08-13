// app/blog/[slug]/page.tsx
import React from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import dbConnect from "@/lib/mongodb";
import Post from "@/models/Post";
import { IPost, IContentBlock } from "@/models/Post";
import Header from "@/components/Header";
import SportsNav from "@/components/SportsNav";
import Footer from "@/components/Footer";
import BlogPostLayout from "@/components/BlogPostLayout";

async function getPost(slug: string): Promise<IPost | null> {
  await dbConnect();
  const post = await Post.findOne({ slug })
    .populate("categories", "_id name")
    .populate("tags", "_id name")
    .lean();
  return post as IPost | null;
}

async function getRelatedPosts(
  categoryIds: string[],
  currentPostId: string
): Promise<IPost[]> {
  if (!categoryIds || categoryIds.length === 0) {
    return [];
  }
  await dbConnect();
  const posts = await Post.find({
    categories: { $in: categoryIds },
    _id: { $ne: currentPostId }
  })
    .sort({ createdAt: -1 })
    .limit(4)
    .select("title slug featuredImageUrl createdAt")
    .lean();
  return posts as IPost[];
}

export async function generateMetadata({
  params
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);
  if (!post) {
    return {
      title: "Post Not Found | TLiveScores",
      robots: { index: false, follow: false }
    };
  }
  const publicDomain = "https://todaylivescores.com";
  const canonicalUrl = `${publicDomain}/blog/${post.slug}`;
  const defaultImage = "/social-card-blog.png";
  const imageUrl = post.featuredImageUrl
    ? `${publicDomain}${post.featuredImageUrl}`
    : `${publicDomain}${defaultImage}`;
  const mainTitle = post.title || "Untitled Article";
  const firstParagraph =
    post.content?.blocks?.find(
      (b: IContentBlock) => b.type === "paragraph"
    )?.data.text || "";
  const safeDescription = (post.description || firstParagraph)
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);
  const keywords =
    Array.isArray(post.keywords) && post.keywords.length > 0
      ? post.keywords
      : [
          "sports",
          "analysis",
          "match preview",
          "football",
          "basketball",
          "boxing",
          "tennis",
          "TLiveScores"
        ];
  const authorName =
    typeof post.author === "string" && post.author.trim()
      ? post.author
      : "TLiveScores Editorial Team";

  return {
    title: `${mainTitle} | TLiveScores`,
    description: safeDescription,
    metadataBase: new URL(publicDomain),
    alternates: { canonical: canonicalUrl },
    keywords,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        maxSnippet: -1,
        maxImagePreview: "large",
        maxVideoPreview: -1
      }
    },
    openGraph: {
      title: mainTitle,
      description: safeDescription,
      url: canonicalUrl,
      siteName: "TLiveScores",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: mainTitle }],
      type: "article",
      authors: [authorName]
    },
    twitter: {
      card: "summary_large_image",
      title: mainTitle,
      description: safeDescription,
      images: [imageUrl]
    },
    other: {
      author: authorName,
      publisher: "TLiveScores"
    }
  };
}

export default async function BlogPostPage({
  params
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);
  if (!post) {
    notFound();
  }
  const categoryIds = ((post.categories as { _id: string }[]) || []).map(
    (cat) => cat._id
  );
  const relatedPosts = await getRelatedPosts(
    categoryIds,
    post._id.toString()
  );
  return (
    <div className="bg-[#1d222d] text-white min-h-screen">
      <Header />
      <SportsNav />
      <BlogPostLayout
        post={JSON.parse(JSON.stringify(post))}
        relatedPosts={JSON.parse(JSON.stringify(relatedPosts))}
      />
      <Footer />
    </div>
  );
}
