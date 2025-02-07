"use client";

import { CalendarIcon, ClockIcon, UsersIcon, TableIcon, PencilIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";

// PostgreSQL'deki reservation tablosu için type
export interface Reservation {
  reservation_id: number;
  table_id: number;
  branch_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  reservation_date: string; // ISO string format
  reservation_time: string; // HH:mm format
  status: 'confirmed' | 'pending' | 'cancelled';
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Table bilgileri
  table_name?: string;
  table_capacity?: number;
  table_status?: string;
  // Section bilgileri
  section_name?: string;
  section_description?: string;
  is_smoking?: boolean;
  is_outdoor?: boolean;
  is_vip?: boolean;
}

interface ReservationCardProps {
  reservation: {
    id: number;
    customerName: string;
    customerPhone: string;
    guestCount: number;
    reservationDate: string;
    reservationTime: string;
    tableId: number;
    tableName: string;
    sectionId: number;
    sectionName: string;
    status: string;
    specialnotes?: string;
  };
  index: number;
  onEdit: (reservation: any) => void;
}

const getStatusColor = (status: string) => {
  return status === 'confirmed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' : 
         status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
         'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
};

const getSectionFeatures = (reservation: Reservation) => {
  const features = [];
  
  if (reservation.is_smoking) features.push({ label: 'Sigara İçilebilir', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' });
  if (reservation.is_outdoor) features.push({ label: 'Açık Alan', color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' });
  if (reservation.is_vip) features.push({ label: 'VIP', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' });
  
  return features;
};

export function ReservationCard({ reservation, index, onEdit }: ReservationCardProps) {
  // Tarih ve saat formatlaması
  const formattedDate = format(parseISO(reservation.reservationDate), 'dd MMMM yyyy', { locale: tr });
  const formattedTime = reservation.reservationTime.slice(0, 5); // HH:mm formatına çevirme

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative bg-card rounded-lg shadow-sm border overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold">
              {reservation.customerName}
            </h3>
            <p className="text-sm text-muted-foreground">
              {reservation.customerPhone}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge 
              variant={
                reservation.status === 'confirmed' ? 'default' :
                reservation.status === 'pending' ? 'secondary' :
                reservation.status === 'cancelled' ? 'destructive' :
                'outline'
              }
            >
              {reservation.status === 'confirmed' ? 'Onaylandı' :
               reservation.status === 'pending' ? 'Beklemede' :
               reservation.status === 'cancelled' ? 'İptal' : 
               reservation.status}
            </Badge>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <ClockIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{formattedTime}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <UsersIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{reservation.guestCount} Kişi</span>
          </div>
          <div className="flex items-center gap-2">
            <TableIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{reservation.tableName}</span>
          </div>
        </div>

        {reservation.specialnotes && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              {reservation.specialnotes}
            </p>
          </div>
        )}
      </div>

      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(reservation)}
        >
          <PencilIcon className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
