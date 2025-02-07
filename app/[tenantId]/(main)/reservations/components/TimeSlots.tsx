"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

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
  return (
    <div className="space-y-2">
      <h3 className="font-medium mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4 text-primary" />
        Özet Bilgiler
      </h3>
      <div className="grid gap-2">
        {timeSlots.map((slot, index) => (
          <motion.div
            key={slot.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer bg-white dark:bg-gray-900 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${slot.color}`} />
              <div className="flex flex-col">
                <span className="text-sm font-medium">{slot.label}</span>
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
