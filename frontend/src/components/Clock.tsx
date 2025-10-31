import { useTime } from '../hooks/useTime';
import { useSettings } from '../hooks/useSettings';

export function Clock() {
  const time = useTime();
  const { settings } = useSettings();

  const formatTime = (date: Date) => {
    if (settings.timeFormat === '12h') {
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes}:${seconds} ${ampm}`;
    } else {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      return `${hours}:${minutes}:${seconds}`;
    }
  };

  return (
    <div className="text-center mb-8">
      <time
        dateTime={time.toISOString()}
        className="text-6xl md:text-8xl font-bold tracking-wider font-mono"
      >
        {formatTime(time)}
      </time>
    </div>
  );
}
