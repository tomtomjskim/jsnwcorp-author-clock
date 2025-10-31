import { useTime } from '../hooks/useTime';
import { useSettings } from '../hooks/useSettings';

export function DateDisplay() {
  const time = useTime();
  const { settings } = useSettings();

  // Don't render if hidden
  if (settings.dateFormat === 'hidden') {
    return null;
  }

  const formatDate = (date: Date) => {
    switch (settings.dateFormat) {
      case 'ko-long':
        // 2025년 10월 31일 목요일
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });
      case 'ko-short':
        // 2025.10.31
        return date.toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      case 'en-long':
        // Thursday, October 31, 2025
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          weekday: 'long',
        });
      case 'en-short':
        // 10/31/2025
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      case 'en-iso':
        // 2025-10-31
        return date.toISOString().split('T')[0];
      default:
        return date.toLocaleDateString();
    }
  };

  return (
    <div className="text-center select-none">
      <time
        dateTime={time.toISOString().split('T')[0]}
        className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 font-medium"
      >
        {formatDate(time)}
      </time>
    </div>
  );
}
