import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../api/quotes';
import type { Language } from '../types/quote';

export function useTodayQuote(language: Language = 'ko') {
  return useQuery({
    queryKey: ['quote', 'today', language],
    queryFn: () => quotesApi.getTodayQuote(language),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
  });
}

export function useRandomQuote(language: Language = 'ko') {
  return useQuery({
    queryKey: ['quote', 'random', language, Date.now()],
    queryFn: () => quotesApi.getRandomQuote(language),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
  });
}
