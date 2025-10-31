import { X, Clock as ClockIcon, RefreshCw, Calendar } from 'lucide-react';
import { useSettings, type TimeFormat, type QuoteInterval, type DateFormat, type DatePosition } from '../hooks/useSettings';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUOTE_INTERVALS: { value: QuoteInterval; label: string }[] = [
  { value: 1, label: '1분' },
  { value: 5, label: '5분' },
  { value: 10, label: '10분' },
  { value: 30, label: '30분' },
  { value: 60, label: '1시간' },
  { value: 360, label: '6시간' },
  { value: 720, label: '12시간' },
  { value: 1440, label: '24시간 (하루)' },
];

const DATE_FORMATS: { value: DateFormat; label: string }[] = [
  { value: 'hidden', label: '숨김' },
  { value: 'ko-long', label: '한글 긴 형식 (2025년 10월 31일 목요일)' },
  { value: 'ko-short', label: '한글 짧은 형식 (2025.10.31)' },
  { value: 'en-long', label: '영문 긴 형식 (Thursday, October 31, 2025)' },
  { value: 'en-short', label: '영문 짧은 형식 (10/31/2025)' },
  { value: 'en-iso', label: 'ISO 형식 (2025-10-31)' },
];

const DATE_POSITIONS: { value: DatePosition; label: string }[] = [
  { value: 'above-time', label: '시간 위' },
  { value: 'below-time', label: '시간 아래' },
  { value: 'above-quote', label: '명언 위' },
  { value: 'below-quote', label: '명언 아래' },
];

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettings();

  if (!isOpen) return null;

  const handleTimeFormatChange = (format: TimeFormat) => {
    updateSettings({ timeFormat: format });
  };

  const handleQuoteIntervalChange = (interval: QuoteInterval) => {
    updateSettings({ quoteInterval: interval });
  };

  const handleDateFormatChange = (format: DateFormat) => {
    updateSettings({ dateFormat: format });
  };

  const handleDatePositionChange = (position: DatePosition) => {
    updateSettings({ datePosition: position });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Settings Panel */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto animate-slide-in">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">설정</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close settings"
            >
              <X size={24} />
            </button>
          </div>

          {/* Time Format Setting */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon size={20} />
              <h3 className="text-lg font-semibold">시간 표기</h3>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="timeFormat"
                  value="24h"
                  checked={settings.timeFormat === '24h'}
                  onChange={() => handleTimeFormatChange('24h')}
                  className="w-4 h-4"
                />
                <span>24시간 (예: 14:30:45)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="timeFormat"
                  value="12h"
                  checked={settings.timeFormat === '12h'}
                  onChange={() => handleTimeFormatChange('12h')}
                  className="w-4 h-4"
                />
                <span>12시간 (예: 2:30:45 PM)</span>
              </label>
            </div>
          </div>

          {/* Quote Interval Setting */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <RefreshCw size={20} />
              <h3 className="text-lg font-semibold">명언 변경 주기</h3>
            </div>
            <select
              value={settings.quoteInterval}
              onChange={(e) => handleQuoteIntervalChange(Number(e.target.value) as QuoteInterval)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {QUOTE_INTERVALS.map((interval) => (
                <option key={interval.value} value={interval.value}>
                  {interval.label}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              선택한 시간마다 새로운 명언이 표시됩니다
            </p>
          </div>

          {/* Date Format Setting */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={20} />
              <h3 className="text-lg font-semibold">날짜 표기</h3>
            </div>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value as DateFormat)}
              className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DATE_FORMATS.map((format) => (
                <option key={format.value} value={format.value}>
                  {format.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date Position Setting */}
          {settings.dateFormat !== 'hidden' && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={20} />
                <h3 className="text-lg font-semibold">날짜 위치</h3>
              </div>
              <select
                value={settings.datePosition}
                onChange={(e) => handleDatePositionChange(e.target.value as DatePosition)}
                className="w-full p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {DATE_POSITIONS.map((position) => (
                  <option key={position.value} value={position.value}>
                    {position.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Reset Button */}
          <button
            onClick={resetSettings}
            className="w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            설정 초기화
          </button>
        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
}
