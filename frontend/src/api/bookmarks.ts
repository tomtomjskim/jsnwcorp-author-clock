import { apiClient } from './client';
import type { ApiResponse, Quote } from '../types/quote';

export interface BookmarkResponse {
  bookmarked: boolean;
}

export interface BookmarkedQuotesResponse {
  quotes: Quote[];
  total: number;
}

/**
 * 북마크 추가
 * @param quoteId 명언 ID
 * @returns 북마크 상태
 */
export async function addBookmark(quoteId: number): Promise<BookmarkResponse> {
  const response = await apiClient.post<ApiResponse<BookmarkResponse>>(
    `/quotes/${quoteId}/bookmark`
  );
  return response.data.data!;
}

/**
 * 북마크 제거
 * @param quoteId 명언 ID
 * @returns 북마크 상태
 */
export async function removeBookmark(quoteId: number): Promise<BookmarkResponse> {
  const response = await apiClient.delete<ApiResponse<BookmarkResponse>>(
    `/quotes/${quoteId}/bookmark`
  );
  return response.data.data!;
}

/**
 * 북마크 토글 (추가 또는 제거)
 * @param quoteId 명언 ID
 * @param currentlyBookmarked 현재 북마크 상태
 * @returns 업데이트된 북마크 상태
 */
export async function toggleBookmark(
  quoteId: number,
  currentlyBookmarked: boolean
): Promise<BookmarkResponse> {
  if (currentlyBookmarked) {
    return removeBookmark(quoteId);
  } else {
    return addBookmark(quoteId);
  }
}

/**
 * 내 북마크 목록 조회
 * @param limit 조회 개수
 * @param offset 시작 위치
 * @returns 북마크한 명언 목록
 */
export async function getBookmarks(
  limit: number = 50,
  offset: number = 0
): Promise<BookmarkedQuotesResponse> {
  const response = await apiClient.get<ApiResponse<BookmarkedQuotesResponse>>(
    `/bookmarks`,
    {
      params: { limit, offset },
    }
  );
  return response.data.data!;
}

/**
 * 특정 명언의 북마크 상태 확인
 * @param quoteId 명언 ID
 * @returns 북마크 여부
 */
export async function getBookmarkStatus(quoteId: number): Promise<BookmarkResponse> {
  const response = await apiClient.get<ApiResponse<BookmarkResponse>>(
    `/quotes/${quoteId}/bookmark-status`
  );
  return response.data.data!;
}

/**
 * 북마크 개수 조회
 * @returns 북마크 개수
 */
export async function getBookmarkCount(): Promise<number> {
  const response = await apiClient.get<ApiResponse<{ count: number }>>(
    `/bookmarks/count`
  );
  return response.data.data!.count;
}
