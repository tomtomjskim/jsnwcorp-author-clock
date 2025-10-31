import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Clock } from './components/Clock';
import { DateDisplay } from './components/DateDisplay';
import { QuoteDisplay } from './components/QuoteDisplay';
import { ControlPanel } from './components/ControlPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { useTodayQuote, useRandomQuote } from './hooks/useQuote';
import { useTheme } from './hooks/useTheme';
import { useFullscreen } from './hooks/useFullscreen';
import { useSettings } from './hooks/useSettings';
import { useDoubleClick } from './hooks/useDoubleClick';
import { useIdleDetection } from './hooks/useIdleDetection';
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

  // Enable double-click/double-tap fullscreen toggle
  useDoubleClick({
    onDoubleClick: toggleFullscreen,
    excludeSelectors: ['button', 'a', 'input', 'textarea', 'select', 'label', '[role="dialog"]', '.settings-panel'],
  });

  // Auto-hide controls on idle
  const { shouldShowControls } = useIdleDetection({
    idleTimeout: 3000,
    showOnBottomZone: true,
    bottomZonePercentage: 20,
  });

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

    // Set up interval for auto-rotation
    const intervalMs = settings.quoteInterval * 60 * 1000;
    const interval = setInterval(() => {
      refetchRandom();
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.quoteInterval]);

  // Fetch new quote immediately when switching to interval mode
  useEffect(() => {
    if (quoteMode === 'interval') {
      refetchRandom();
    }
  }, [quoteMode]);

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
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-6xl gap-4">
        {settings.datePosition === 'above-time' && <DateDisplay />}
        <Clock />
        {settings.datePosition === 'below-time' && <DateDisplay />}
        {settings.datePosition === 'above-quote' && <DateDisplay />}
        <QuoteDisplay quote={quote} isLoading={isLoading} error={error} />
        {settings.datePosition === 'below-quote' && <DateDisplay />}
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
        isVisible={shouldShowControls}
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
