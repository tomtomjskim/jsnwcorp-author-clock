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
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { useDoubleClick } from './hooks/useDoubleClick';
import { useIdleDetection } from './hooks/useIdleDetection';
import type { Language } from './types/quote';

const queryClient = new QueryClient();

function AuthorClock() {
  const [language] = useState<Language>('ko');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { settings } = useSettings();

  // Determine quote mode based on settings
  const quoteMode = settings.quoteInterval === 1440 ? 'daily' : 'interval';

  const { data: dailyQuote, isLoading: isLoadingDaily, error: dailyError, refetch: refetchDaily, isRefetching: isRefetchingDaily } = useTodayQuote(language, quoteMode === 'daily');
  const { data: randomQuote, isLoading: isLoadingRandom, error: randomError, refetch: refetchRandom, isRefetching: isRefetchingRandom } = useRandomQuote(language, quoteMode === 'interval');
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

  // Auto-rotate quotes based on interval setting (crontab-like: aligned to clock)
  useEffect(() => {
    // Skip if in daily mode
    if (quoteMode === 'daily') {
      return;
    }

    const intervalMinutes = settings.quoteInterval;
    const intervalMs = intervalMinutes * 60 * 1000;

    // Calculate milliseconds until next aligned time (crontab-like)
    const calculateNextDelay = () => {
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const currentSeconds = now.getSeconds();
      const currentMs = now.getMilliseconds();

      // Calculate next interval boundary
      const nextIntervalMinutes = Math.ceil(currentMinutes / intervalMinutes) * intervalMinutes;
      const minutesUntilNext = nextIntervalMinutes - currentMinutes;
      const secondsUntilNext = minutesUntilNext * 60 - currentSeconds;
      const msUntilNext = secondsUntilNext * 1000 - currentMs;

      return msUntilNext > 0 ? msUntilNext : intervalMs;
    };

    let timeout: number;
    let interval: number;

    // Wait until next aligned time, then fetch and set up regular interval
    const initialDelay = calculateNextDelay();

    timeout = setTimeout(() => {
      refetchRandom(); // Fetch at aligned time

      // Set up regular interval after first aligned fetch
      interval = setInterval(() => {
        refetchRandom();
      }, intervalMs);
    }, initialDelay);

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [settings.quoteInterval, quoteMode, refetchRandom]);

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
    <SettingsProvider>
      <QueryClientProvider client={queryClient}>
        <AuthorClock />
      </QueryClientProvider>
    </SettingsProvider>
  );
}

export default App;
