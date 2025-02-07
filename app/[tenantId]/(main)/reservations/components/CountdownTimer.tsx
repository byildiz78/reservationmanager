import { useEffect, useState } from 'react';
import { parseISO, format, isToday, differenceInMilliseconds } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  reservationDate: string;
  reservationTime: string;
}

export function CountdownTimer({ reservationDate, reservationTime }: CountdownTimerProps) {
  const [countdown, setCountdown] = useState<string>('');
  const [isOverdue, setIsOverdue] = useState(false);

  useEffect(() => {
    const date = parseISO(reservationDate);
    const today = new Date();
    
    const [hours, minutes] = reservationTime.split(':');
    
    const reservationDateTime = new Date(date);
    reservationDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);

    const timer = setInterval(() => {
      const now = new Date();
      const diff = reservationDateTime.getTime() - now.getTime();

      if (diff <= 0) {
        const overdueMinutes = Math.abs(Math.floor(diff / (1000 * 60)));
        setIsOverdue(true);
        setCountdown(`${overdueMinutes} dk gecikme`);
      } else {
        setIsOverdue(false);
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        setCountdown(`${hours}s ${minutes}dk kaldı`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [reservationDate, reservationTime]);

  if (!countdown) return null;

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
      isOverdue 
        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    }`}>
      <Clock className="h-4 w-4" />
      <span className="text-sm font-medium">{countdown}</span>
    </div>
  );
}
