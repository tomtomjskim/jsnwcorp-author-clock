import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Clock } from './components/Clock';
import { QuoteDisplay } from './components/QuoteDisplay';
import { ControlPanel } from './components/ControlPanel';
import { useTodayQuote } from './hooks/useQuote';
import { useTheme } from './hooks/useTheme';
import { useFullscreen } from './hooks/useFullscreen';
import type { Language } from './types/quote';

const queryClient = new QueryClient();

function AuthorClock() {
  const [language] = useState<Language>('ko');
  const { data: quote, isLoading, error, refetch, isRefetching } = useTodayQuote(language);
  const { theme, toggleTheme } = useTheme();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const handleRefresh = () => {
    refetch();
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
        isRefreshing={isRefetching}
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
