import { useLike } from '../hooks/useLike';

interface LikeButtonProps {
  quoteId: number;
  initialLiked?: boolean;
  initialCount?: number;
  className?: string;
}

/**
 * 좋아요 버튼 컴포넌트
 * - 하트 아이콘 (♡ / ♥)
 * - 좋아요 수 표시
 * - 클릭 애니메이션
 */
export function LikeButton({
  quoteId,
  initialLiked = false,
  initialCount = 0,
  className = '',
}: LikeButtonProps) {
  const { isLiked, likesCount, toggleLike, isLoading } = useLike({
    quoteId,
    initialLiked,
    initialCount,
  });

  return (
    <button
      onClick={toggleLike}
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
      aria-label={isLiked ? '좋아요 취소' : '좋아요'}
    >
      {/* 하트 아이콘 */}
      <span
        className={`
          text-2xl transition-all duration-300
          ${isLiked ? 'animate-like-bounce' : ''}
          ${isLoading ? 'animate-pulse' : ''}
        `}
        style={{
          color: isLiked ? '#ef4444' : 'currentColor', // red-500
        }}
      >
        {isLiked ? '♥' : '♡'}
      </span>

      {/* 좋아요 수 */}
      <span
        className="
          text-sm font-medium
          text-gray-600 dark:text-gray-400
          group-hover:text-gray-900 dark:group-hover:text-gray-100
          transition-colors duration-200
        "
      >
        {likesCount}
      </span>
    </button>
  );
}
