import React from 'react';
import { X, Bookmark as BookmarkIcon, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBookmarks, removeBookmark } from '../api/bookmarks';

interface BookmarkPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onQuoteSelect?: (quoteId: number) => void;
}

export function BookmarkPanel({ isOpen, onClose, onQuoteSelect }: BookmarkPanelProps) {
  const queryClient = useQueryClient();
  const [limit, setLimit] = React.useState(20);

  // 북마크 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ['bookmarks', limit],
    queryFn: () => getBookmarks(limit, 0),
    enabled: isOpen, // 패널이 열렸을 때만 조회
  });

  // 북마크 제거 mutation
  const removeBookmarkMutation = useMutation({
    mutationFn: (quoteId: number) => removeBookmark(quoteId),
    onSuccess: () => {
      // 북마크 목록 다시 조회
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });

  if (!isOpen) return null;

  const handleRemoveBookmark = (quoteId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 부모 클릭 이벤트 방지
    removeBookmarkMutation.mutate(quoteId);
  };

  const handleQuoteClick = (quoteId: number) => {
    if (onQuoteSelect) {
      onQuoteSelect(quoteId);
      onClose(); // 패널 닫기
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Bookmark Panel */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto animate-slide-in"
        role="dialog"
        aria-label="북마크 패널"
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BookmarkIcon size={24} className="text-yellow-400" />
              <h2 className="text-2xl font-bold">내 북마크</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="닫기"
            >
              <X size={24} />
            </button>
          </div>

          {/* Content */}
          {isLoading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-red-500">
              <p>북마크를 불러오는데 실패했습니다</p>
            </div>
          )}

          {!isLoading && !error && data && (
            <>
              {/* Statistics */}
              <div className="mb-4 space-y-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  총 {data.total}개의 북마크
                </div>
                {data.quotes.length > 0 && (() => {
                  const avgLikes = Math.round(
                    data.quotes.reduce((sum, q) => sum + q.likes_count, 0) / data.quotes.length
                  );
                  const mostLiked = data.quotes.reduce((max, q) =>
                    q.likes_count > max.likes_count ? q : max
                  );
                  return (
                    <div className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                      <div>평균 좋아요: {avgLikes}개</div>
                      <div>가장 인기있는 명언: ❤️ {mostLiked.likes_count}개</div>
                    </div>
                  );
                })()}
              </div>

              {/* Bookmark List */}
              {data.quotes.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  <BookmarkIcon size={48} className="mx-auto mb-4 opacity-30" />
                  <p>아직 북마크한 명언이 없습니다</p>
                  <p className="text-sm mt-2">마음에 드는 명언에 ★ 버튼을 눌러보세요</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.quotes.map((quote) => (
                    <div
                      key={quote.id}
                      onClick={() => handleQuoteClick(quote.id)}
                      className="
                        p-4 rounded-lg border border-gray-200 dark:border-gray-700
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        transition-colors cursor-pointer
                        group
                      "
                    >
                      {/* Quote Text */}
                      <p className="text-sm mb-2 line-clamp-3">"{quote.text}"</p>

                      {/* Author & Actions */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          - {quote.author}
                        </span>

                        {/* Remove Button */}
                        <button
                          onClick={(e) => handleRemoveBookmark(quote.id, e)}
                          disabled={removeBookmarkMutation.isPending}
                          className="
                            p-2 rounded-lg
                            text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20
                            transition-colors
                            opacity-0 group-hover:opacity-100
                            disabled:opacity-50
                            sm:opacity-0 sm:group-hover:opacity-100
                            max-sm:opacity-100
                          "
                          aria-label="북마크 제거"
                          title="북마크 제거"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span>❤️ {quote.likes_count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {data.quotes.length > 0 && data.quotes.length < data.total && (
                <button
                  onClick={() => setLimit(prev => prev + 20)}
                  className="w-full mt-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  더 보기 ({data.quotes.length} / {data.total})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
