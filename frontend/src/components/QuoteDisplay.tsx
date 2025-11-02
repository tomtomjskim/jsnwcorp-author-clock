import type { Quote } from '../types/quote';
import { LikeButton } from './LikeButton';
import { BookmarkButton } from './BookmarkButton';

interface QuoteDisplayProps {
  quote: Quote | undefined;
  isLoading: boolean;
  error: Error | null;
  isFullscreen?: boolean;
}

export function QuoteDisplay({ quote, isLoading, error, isFullscreen = false }: QuoteDisplayProps) {
  if (isLoading) {
    return (
      <div className="text-center py-12 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        <p className="text-xl">오류가 발생했습니다</p>
        <p className="text-sm mt-2 opacity-75">{error.message}</p>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        <p className="text-xl">명언을 불러올 수 없습니다</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-8 px-4 animate-fade-in select-none">
      {/* Quote Text */}
      <blockquote className="text-2xl md:text-4xl font-serif leading-relaxed mb-8 text-balance">
        "{quote.text}"
      </blockquote>

      {/* Author */}
      <div className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-2">
        - {quote.author}
      </div>

      {/* Source */}
      {quote.source && (
        <div className="text-sm md:text-base text-gray-500 dark:text-gray-400 italic">
          『{quote.source}』
        </div>
      )}

      {/* Action Buttons (hidden in fullscreen) */}
      {!isFullscreen && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <LikeButton
            quoteId={quote.id}
            initialLiked={quote.isLiked}
            initialCount={quote.likes_count}
          />
          <BookmarkButton
            quoteId={quote.id}
            initialBookmarked={quote.isBookmarked}
          />
        </div>
      )}
    </div>
  );
}
