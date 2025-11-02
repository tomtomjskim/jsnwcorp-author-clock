import { useBookmark } from '../hooks/useBookmark';
import { Bookmark } from 'lucide-react';

interface BookmarkButtonProps {
  quoteId: number;
  initialBookmarked?: boolean;
  className?: string;
}

/**
 * 북마크 버튼 컴포넌트
 * - Bookmark 아이콘 (lucide-react, ControlPanel과 동일)
 * - 클릭 애니메이션
 */
export function BookmarkButton({
  quoteId,
  initialBookmarked = false,
  className = '',
}: BookmarkButtonProps) {
  const { isBookmarked, toggleBookmark, isLoading } = useBookmark({
    quoteId,
    initialBookmarked,
  });

  return (
    <button
      onClick={toggleBookmark}
      disabled={isLoading}
      className={`
        flex items-center gap-2
        px-4 py-2 rounded-lg
        transition-all duration-200
        hover:bg-gray-100 dark:hover:bg-gray-800
        disabled:opacity-50 disabled:cursor-not-allowed
        group
        ${className}
      `}
      aria-label={isBookmarked ? '북마크 제거' : '북마크 추가'}
    >
      {/* Bookmark 아이콘 (ControlPanel과 동일한 아이콘 사용) */}
      <Bookmark
        size={20}
        className={`
          text-yellow-400 transition-all duration-300
          ${isBookmarked ? 'animate-bookmark-twinkle' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
        fill={isBookmarked ? 'currentColor' : 'none'}
      />

      {/* 북마크 텍스트 */}
      <span
        className="
          text-sm font-medium
          text-gray-600 dark:text-gray-400
          group-hover:text-gray-900 dark:group-hover:text-gray-100
          transition-colors duration-200
        "
      >
        {isBookmarked ? '북마크됨' : '북마크'}
      </span>
    </button>
  );
}
