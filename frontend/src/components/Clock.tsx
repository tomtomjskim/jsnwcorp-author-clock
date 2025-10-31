import { useTime } from '../hooks/useTime';

export function Clock() {
  const time = useTime();

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
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
