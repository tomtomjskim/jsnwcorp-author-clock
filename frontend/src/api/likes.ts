import { apiClient } from './client';
import type { ApiResponse, Quote } from '../types/quote';

export interface LikeResponse {
  liked: boolean;
  likes_count: number;
}

export interface LikedQuotesResponse {
  quotes: Quote[];
  total: number;
}

/**
 * 좋아요 추가
 * @param quoteId 명언 ID
 * @returns 좋아요 상태 및 카운트
 */
export async function addLike(quoteId: number): Promise<LikeResponse> {
  const response = await apiClient.post<ApiResponse<LikeResponse>>(
    `/quotes/${quoteId}/like`
  );
  return response.data.data!;
}

/**
 * 좋아요 제거
 * @param quoteId 명언 ID
 * @returns 좋아요 상태 및 카운트
 */
export async function removeLike(quoteId: number): Promise<LikeResponse> {
  const response = await apiClient.delete<ApiResponse<LikeResponse>>(
    `/quotes/${quoteId}/like`
  );
  return response.data.data!;
}

/**
 * 좋아요 토글 (추가 또는 제거)
 * @param quoteId 명언 ID
 * @param currentlyLiked 현재 좋아요 상태
 * @returns 업데이트된 좋아요 상태 및 카운트
 */
export async function toggleLike(
  quoteId: number,
  currentlyLiked: boolean
): Promise<LikeResponse> {
  if (currentlyLiked) {
    return removeLike(quoteId);
  } else {
    return addLike(quoteId);
  }
}

/**
 * 내가 좋아요한 명언 목록 조회
 * @param limit 조회 개수
 * @param offset 시작 위치
 * @returns 좋아요한 명언 목록
 */
export async function getLikedQuotes(
  limit: number = 50,
  offset: number = 0
): Promise<LikedQuotesResponse> {
  const response = await apiClient.get<ApiResponse<LikedQuotesResponse>>(
    `/quotes/liked`,
    {
      params: { limit, offset },
    }
  );
  return response.data.data!;
}

/**
 * 특정 명언의 좋아요 상태 확인
 * @param quoteId 명언 ID
 * @returns 좋아요 여부 및 카운트
 */
export async function getLikeStatus(quoteId: number): Promise<LikeResponse> {
  const response = await apiClient.get<ApiResponse<LikeResponse>>(
    `/quotes/${quoteId}/like-status`
  );
  return response.data.data!;
}
