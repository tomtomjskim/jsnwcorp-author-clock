import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleLike } from '../api/likes';
import { useState, useEffect } from 'react';

interface UseLikeOptions {
  quoteId: number;
  initialLiked?: boolean;
  initialCount?: number;
  onSuccess?: (liked: boolean, count: number) => void;
  onError?: (error: Error) => void;
}

/**
 * 좋아요 기능 커스텀 훅
 * - Optimistic UI 업데이트
 * - localStorage 백업
 * - React Query 캐시 무효화
 */
export function useLike({
  quoteId,
  initialLiked = false,
  initialCount = 0,
  onSuccess,
  onError,
}: UseLikeOptions) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialCount);
  const queryClient = useQueryClient();

  // localStorage 키
  const STORAGE_KEY = `quote-${quoteId}-liked`;

  // 초기 상태를 localStorage에서 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      const storedLiked = stored === 'true';
      setIsLiked(storedLiked);
    } else {
      setIsLiked(initialLiked);
    }
    setLikesCount(initialCount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteId, initialLiked, initialCount]);

  // 좋아요 토글 mutation
  const likeMutation = useMutation({
    mutationFn: () => toggleLike(quoteId, isLiked),
    onMutate: async () => {
      // Optimistic UI 업데이트
      const newLiked = !isLiked;
      const newCount = newLiked ? likesCount + 1 : Math.max(likesCount - 1, 0);

      setIsLiked(newLiked);
      setLikesCount(newCount);

      // localStorage에 저장
      localStorage.setItem(STORAGE_KEY, String(newLiked));

      return { previousLiked: isLiked, previousCount: likesCount };
    },
    onSuccess: (data) => {
      // 서버 응답으로 상태 동기화
      setIsLiked(data.liked);
      setLikesCount(data.likes_count);
      localStorage.setItem(STORAGE_KEY, String(data.liked));

      // React Query 캐시 무효화 (명언 목록 등 다른 쿼리 갱신)
      queryClient.invalidateQueries({ queryKey: ['quote', 'random'] });
      queryClient.invalidateQueries({ queryKey: ['quote', 'today'] });

      onSuccess?.(data.liked, data.likes_count);
    },
    onError: (error: Error, _, context) => {
      // 에러 시 이전 상태로 롤백
      if (context) {
        setIsLiked(context.previousLiked);
        setLikesCount(context.previousCount);
        localStorage.setItem(STORAGE_KEY, String(context.previousLiked));
      }

      console.error('Failed to toggle like:', error);
      onError?.(error);
    },
  });

  return {
    isLiked,
    likesCount,
    toggleLike: () => likeMutation.mutate(),
    isLoading: likeMutation.isPending,
    isError: likeMutation.isError,
    error: likeMutation.error,
  };
}
