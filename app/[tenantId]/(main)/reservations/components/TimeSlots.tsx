"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useReservationStore } from "@/stores/reservation-store";
import { format } from "date-fns";

interface TimeSlot {
  label: string;
  count: number;
  color: string;
  time: string;
}

const timeSlots: TimeSlot[] = [
 
  { label: 'Öğlen', count: 8, color: 'bg-yellow-500', time: '11:00 - 15:00' },
  { label: 'Akşam', count: 48, color: 'bg-purple-500', time: '15:00 - 22:00' },
  { label: 'Gece', count: 6, color: 'bg-slate-500', time: '22:00 - 02:00' },
];

export function TimeSlots() {
  const { reservations, selectedDate } = useReservationStore();
  const currentDate = selectedDate || new Date();

  // Filter reservations for selected date
  const dateReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.reservationDate);
    return format(reservationDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
  });

  // Count reservations by time slot
  const lunchCount = dateReservations.filter(r => {
    const hour = parseInt(r.reservationTime.split(':')[0]);
    return hour >= 11 && hour < 15;
  }).length;

  const dinnerCount = dateReservations.filter(r => {
    const hour = parseInt(r.reservationTime.split(':')[0]);
    return hour >= 15 && hour < 22;
  }).length;

  const lateNightCount = dateReservations.filter(r => {
    const hour = parseInt(r.reservationTime.split(':')[0]);
    return hour >= 22 || hour < 2;
  }).length;

  const slots = [
    {
      title: "Öğlen",
      time: "11:00 - 15:00",
      count: lunchCount,
      color: "bg-yellow-100 dark:bg-yellow-900/30",
      textColor: "text-yellow-600 dark:text-yellow-400",
      borderColor: "border-yellow-200 dark:border-yellow-800"
    },
    {
      title: "Akşam",
      time: "15:00 - 22:00",
      count: dinnerCount,
      color: "bg-purple-100 dark:bg-purple-900/30",
      textColor: "text-purple-600 dark:text-purple-400",
      borderColor: "border-purple-200 dark:border-purple-800"
    },
    {
      title: "Gece",
      time: "22:00 - 02:00",
      count: lateNightCount,
      color: "bg-blue-100 dark:bg-blue-900/30",
      textColor: "text-blue-600 dark:text-blue-400",
      borderColor: "border-blue-200 dark:border-blue-800"
    }
  ];

  return (
    <div className="space-y-2">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Özet Bilgiler
      </h3>
      <div className="space-y-2">
        {slots.map((slot) => (
          <motion.div
            key={slot.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: slots.indexOf(slot) * 0.1 }}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer bg-white dark:bg-gray-900 shadow-sm ${slot.color} ${slot.borderColor}`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${slot.color}`} />
              <div className="flex flex-col">
                <span className={`text-sm font-medium ${slot.textColor}`}>{slot.title}</span>
                <span className="text-xs text-muted-foreground">{slot.time}</span>
              </div>
            </div>
            <Badge variant="secondary" className="font-medium">{slot.count}</Badge>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
