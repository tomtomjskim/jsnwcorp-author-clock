import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Clock } from './components/Clock';
import { QuoteDisplay } from './components/QuoteDisplay';
import { ControlPanel } from './components/ControlPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { useTodayQuote, useRandomQuote } from './hooks/useQuote';
import { useTheme } from './hooks/useTheme';
import { useFullscreen } from './hooks/useFullscreen';
import { useSettings } from './hooks/useSettings';
import type { Language } from './types/quote';

const queryClient = new QueryClient();

function AuthorClock() {
  const [language] = useState<Language>('ko');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [quoteMode, setQuoteMode] = useState<'interval' | 'daily'>('daily');

  const { settings } = useSettings();
  const { data: dailyQuote, isLoading: isLoadingDaily, error: dailyError, refetch: refetchDaily, isRefetching: isRefetchingDaily } = useTodayQuote(language);
  const { data: randomQuote, isLoading: isLoadingRandom, error: randomError, refetch: refetchRandom, isRefetching: isRefetchingRandom } = useRandomQuote(language);
  const { theme, toggleTheme } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  // Determine which quote to show based on interval setting
  const quote = quoteMode === 'daily' ? dailyQuote : randomQuote;
  const isLoading = quoteMode === 'daily' ? isLoadingDaily : isLoadingRandom;
  const error = quoteMode === 'daily' ? dailyError : randomError;
  const isRefreshing = quoteMode === 'daily' ? isRefetchingDaily : isRefetchingRandom;

  // Auto-rotate quotes based on interval setting
  useEffect(() => {
    if (settings.quoteInterval === 1440) {
      // 24 hours - use daily quote
      setQuoteMode('daily');
      return;
    }

    // Use interval-based rotation
    setQuoteMode('interval');
    refetchRandom(); // Initial fetch

    const intervalMs = settings.quoteInterval * 60 * 1000;
    const interval = setInterval(() => {
      refetchRandom();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.quoteInterval, refetchRandom]);

  const handleRefresh = () => {
    if (quoteMode === 'daily') {
      refetchDaily();
    } else {
      refetchRandom();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl">
        <Clock />
        <QuoteDisplay quote={quote} isLoading={isLoading} error={error} />
      </div>

      {/* Control Panel */}
      <ControlPanel
        theme={theme}
        isFullscreen={isFullscreen}
        onThemeToggle={toggleTheme}
        onFullscreenToggle={toggleFullscreen}
        onRefresh={handleRefresh}
        onSettingsClick={() => setIsSettingsOpen(true)}
        isRefreshing={isRefreshing}
      />

      {/* Settings Panel */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* App Info (Hidden in Fullscreen) */}
      {!isFullscreen && (
        <div className="fixed top-4 left-4 text-sm text-gray-400 dark:text-gray-600">
          Author Clock
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthorClock />
    </QueryClientProvider>
  );
}

export default App;
