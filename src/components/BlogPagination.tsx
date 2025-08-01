'use client';

import { useRouter, useSearchParams } from 'next/navigation';

interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

const BlogPagination = ({ currentPage, totalPages, basePath }: BlogPaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    current.set('page', page.toString());
    const search = current.toString();
    const query = search ? `?${search}` : '';

    router.push(`${basePath}${query}`);
  };

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  return (
    <nav aria-label="Blog post navigation" className="flex justify-center items-center gap-6 my-12">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="flex items-center justify-center gap-2 px-5 py-2.5 text-lg font-medium text-white bg-[#374151] rounded-lg shadow-md transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-[#323945] disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        <span>←</span>
        <span>Previous</span>
      </button>

      <div className="text-lg font-semibold text-gray-200">
        Page {currentPage} of {totalPages}
      </div>

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={isLastPage}
        className="flex items-center justify-center gap-2 px-5 py-2.5 text-lg font-medium text-white bg-[#374151] rounded-lg shadow-md transition-colors hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:bg-[#323945] disabled:text-gray-500 disabled:cursor-not-allowed"
      >
        <span>Next</span>
        <span>→</span>
      </button>
    </nav>
  );
};

export default BlogPagination;