import { Sun, Moon, Maximize, Minimize, RefreshCw, Settings } from 'lucide-react';

interface ControlPanelProps {
  theme: 'light' | 'dark';
  isFullscreen: boolean;
  onThemeToggle: () => void;
  onFullscreenToggle: () => void;
  onRefresh: () => void;
  onSettingsClick: () => void;
  isRefreshing?: boolean;
}

export function ControlPanel({
  theme,
  isFullscreen,
  onThemeToggle,
  onFullscreenToggle,
  onRefresh,
  onSettingsClick,
  isRefreshing = false,
}: ControlPanelProps) {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-full shadow-lg px-6 py-3 flex items-center gap-4 border border-gray-200 dark:border-gray-700">
      {/* Settings Button */}
      <button
        onClick={onSettingsClick}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title="설정"
        aria-label="설정"
      >
        <Settings size={20} />
      </button>

      {/* Refresh Button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        title="다음 명언"
        aria-label="다음 명언"
      >
        <RefreshCw
          size={20}
          className={isRefreshing ? 'animate-spin' : ''}
        />
      </button>

      {/* Theme Toggle */}
      <button
        onClick={onThemeToggle}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={theme === 'light' ? '다크 모드' : '라이트 모드'}
        aria-label="테마 전환"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      {/* Fullscreen Toggle */}
      <button
        onClick={onFullscreenToggle}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        title={isFullscreen ? '전체화면 해제' : '전체화면'}
        aria-label="전체화면 전환"
      >
        {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
      </button>
    </div>
  );
}
