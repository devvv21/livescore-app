'use client';

import { useState, useEffect, useRef } from 'react';
import Image from "next/image";
import { NewsArticleDetail, Heading } from '@/lib/types';
import ClientOnly from './ClientOnly';
import "../css/news.css";

// Helper function to create clean IDs from heading text.
const generateSlug = (text: string): string => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// --- THE FIX for "Invalid Date" ---
const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'Date not available';
  const date = new Date(dateString);
  return isNaN(date.getTime())
    ? 'Invalid Date'
    : date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
};

interface ArticleBodyProps {
  article: NewsArticleDetail;
}

export default function ArticleBody({ article }: ArticleBodyProps) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const contentContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contentElement = contentContainerRef.current;
    if (!contentElement) return;

    const observer = new MutationObserver((mutations, obs) => {
      const headingElements = contentElement.querySelectorAll('h1, h2, h3');

      if (headingElements.length === 0) return;

      const extracted: Heading[] = [];
      const usedIds: Record<string, number> = {};

      headingElements.forEach((h) => {
        const element = h as HTMLElement;
        const text = element.innerText;
        let baseId = generateSlug(text) || "section";

        if (usedIds[baseId] !== undefined) {
          usedIds[baseId]++;
          element.id = `${baseId}-${usedIds[baseId]}`;
        } else {
          usedIds[baseId] = 0;
          element.id = baseId;
        }
        element.classList.add('scroll-target');
        extracted.push({ id: element.id, text, level: parseInt(element.tagName.substring(1)) });
      });

      setHeadings(extracted);
      obs.disconnect(); // 🔒 Critical fix to prevent infinite observation
    });

    observer.observe(contentElement, { childList: true, subtree: true });

    return () => observer.disconnect(); // Clean up on unmount
  }, [article.full_article]);

  const scrollToHeading = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.pushState(null, '', `#${id}`);
    }
  };

  return (
    <div className="content-and-toc-wrapper">
      <main className="main-article-content">
        <header>
          <p className="text-sm text-blue-400 font-semibold uppercase">
            {article.category?.join(', ')}
          </p>
          <p className="text-gray-400">
            Published on
            <ClientOnly>
              <span> {formatDate(article.publishedAt)}</span>
            </ClientOnly>
          </p>
        </header>

        <div className="relative w-full h-64 md:h-96 my-8 rounded-lg overflow-hidden">
          <Image
            src={article.image_url}
            alt={article.title}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div
          ref={contentContainerRef}
          className="prose prose-invert prose-lg max-w-none text-gray-300"
          dangerouslySetInnerHTML={{ __html: article.full_article || "" }}
        />
      </main>

      {headings.length > 0 && (
        <aside className="toc-container">
          <h3>Table of Contents</h3>
          <ul>
            {headings.map((heading) => (
              <li key={heading.id} className={`toc-level-${heading.level}`}>
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToHeading(heading.id);
                  }}
                >
                  {heading.text}
                </a>
              </li>
            ))}
          </ul>
        </aside>
      )}
    </div>
  );
}
