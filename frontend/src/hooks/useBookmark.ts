import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleBookmark } from '../api/bookmarks';
import { useState, useEffect } from 'react';

interface UseBookmarkOptions {
  quoteId: number;
  initialBookmarked?: boolean;
  onSuccess?: (bookmarked: boolean) => void;
  onError?: (error: Error) => void;
}

/**
 * 북마크 기능 커스텀 훅
 * - Optimistic UI 업데이트
 * - localStorage 백업
 * - React Query 캐시 무효화
 */
export function useBookmark({
  quoteId,
  initialBookmarked = false,
  onSuccess,
  onError,
}: UseBookmarkOptions) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const queryClient = useQueryClient();

  // localStorage 키
  const STORAGE_KEY = `quote-${quoteId}-bookmarked`;

  // 초기 상태를 localStorage에서 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const storedBookmarked = stored === 'true';
      setIsBookmarked(storedBookmarked);
    } else {
      setIsBookmarked(initialBookmarked);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, initialBookmarked]);

  // 북마크 토글 mutation
  const bookmarkMutation = useMutation({
    mutationFn: () => toggleBookmark(quoteId, isBookmarked),
    onMutate: async () => {
      // Optimistic UI 업데이트
      const newBookmarked = !isBookmarked;

      setIsBookmarked(newBookmarked);

      // localStorage에 저장
      localStorage.setItem(STORAGE_KEY, String(newBookmarked));

      return { previousBookmarked: isBookmarked };
    },
    onSuccess: (data) => {
      // 서버 응답으로 상태 동기화
      setIsBookmarked(data.bookmarked);
      localStorage.setItem(STORAGE_KEY, String(data.bookmarked));

      // React Query 캐시 무효화 (북마크 목록 갱신)
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });

      onSuccess?.(data.bookmarked);
    },
    onError: (error: Error, _, context) => {
      // 에러 시 이전 상태로 롤백
      if (context) {
        setIsBookmarked(context.previousBookmarked);
        localStorage.setItem(STORAGE_KEY, String(context.previousBookmarked));
      }

      console.error('Failed to toggle bookmark:', error);
      onError?.(error);
    },
  });

  return {
    isBookmarked,
    toggleBookmark: () => bookmarkMutation.mutate(),
    isLoading: bookmarkMutation.isPending,
    isError: bookmarkMutation.isError,
    error: bookmarkMutation.error,
  };
}
