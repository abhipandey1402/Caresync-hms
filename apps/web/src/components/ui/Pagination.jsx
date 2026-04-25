import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Pagination = ({ 
  currentPage, 
  totalItems, 
  pageSize, 
  onPageChange,
  className 
}) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={cn("flex items-center justify-between px-4 py-4 sm:px-6", className)}>
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-bold text-brand-text-sec hover:bg-brand-bg disabled:opacity-50 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-xl border border-brand-border bg-white px-4 py-2 text-sm font-bold text-brand-text-sec hover:bg-brand-bg disabled:opacity-50 transition-colors"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-brand-text-sec font-medium">
            Showing <span className="font-bold text-[#0F1F17]">{((currentPage - 1) * pageSize) + 1}</span> to <span className="font-bold text-[#0F1F17]">{Math.min(currentPage * pageSize, totalItems)}</span> of{' '}
            <span className="font-bold text-[#0F1F17]">{totalItems}</span> results
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm gap-1" aria-label="Pagination">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-xl p-2 text-brand-text-sec hover:bg-brand-bg focus:z-20 focus:outline-offset-0 disabled:opacity-30 transition-colors"
            >
              <span className="sr-only">Previous</span>
              <ChevronLeft size={20} />
            </button>
            
            {getPageNumbers().map((page, idx) => (
              page === 'ellipsis' ? (
                <span key={`ellipsis-${idx}`} className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-brand-text-sec">
                  <MoreHorizontal size={16} />
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "relative inline-flex items-center rounded-xl px-4 py-2 text-sm font-bold transition-all",
                    currentPage === page
                      ? "z-10 bg-brand-green text-white shadow-md shadow-brand-green/20"
                      : "text-brand-text-sec hover:bg-brand-bg"
                  )}
                >
                  {page}
                </button>
              )
            ))}

            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-xl p-2 text-brand-text-sec hover:bg-brand-bg focus:z-20 focus:outline-offset-0 disabled:opacity-30 transition-colors"
            >
              <span className="sr-only">Next</span>
              <ChevronRight size={20} />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};
