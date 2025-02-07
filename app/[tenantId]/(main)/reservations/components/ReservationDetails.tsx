"use client";

import { MessageCircle, Filter } from "lucide-react";
import { motion } from "framer-motion";

interface ReservationDetailsProps {
  notes?: string;
  specialRequests?: string;
}

export function ReservationDetails({ notes, specialRequests }: ReservationDetailsProps) {
  if (!notes && !specialRequests) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 pt-4 border-t border-dashed flex flex-col gap-3"
    >
      {notes && (
        <div className="flex items-start gap-3 text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <MessageCircle className="h-4 w-4 mt-0.5 text-blue-500" />
          <p className="text-muted-foreground">{notes}</p>
        </div>
      )}
      {specialRequests && (
        <div className="flex items-start gap-3 text-sm bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
          <Filter className="h-4 w-4 mt-0.5 text-amber-500" />
          <p className="text-muted-foreground">{specialRequests}</p>
        </div>
      )}
    </motion.div>
  );
}
