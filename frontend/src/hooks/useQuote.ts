import { useQuery } from '@tanstack/react-query';
import { quotesApi } from '../api/quotes';
import type { Language } from '../types/quote';

export function useTodayQuote(language: Language = 'ko', enabled: boolean = true) {
  return useQuery({
    queryKey: ['quote', 'today', language],
    queryFn: () => quotesApi.getTodayQuote(language),
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useRandomQuote(language: Language = 'ko', enabled: boolean = true) {
  return useQuery({
    queryKey: ['quote', 'random', language],
    queryFn: () => quotesApi.getRandomQuote(language),
    staleTime: 0,
    gcTime: 0,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useQuoteById(quoteId: number | null) {
  return useQuery({
    queryKey: ['quote', 'byId', quoteId],
    queryFn: () => quotesApi.getQuoteById(quoteId!),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    enabled: quoteId !== null,
  });
}
