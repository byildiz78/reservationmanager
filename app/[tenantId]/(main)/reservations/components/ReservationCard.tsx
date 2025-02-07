"use client";

import { Phone, Clock, Users, MapPin, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ReservationActions } from "./ReservationActions";
import { CountdownTimer } from "./CountdownTimer";
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
  reservation: Reservation;
  index: number;
  onEdit: (reservation: Reservation) => void;
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
  const formattedDate = format(parseISO(reservation.reservation_date), 'dd MMMM yyyy', { locale: tr });
  const formattedTime = reservation.reservation_time.slice(0, 5); // HH:mm formatına çevirme

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`p-6 hover:bg-accent/50 transition-all duration-300 cursor-pointer relative overflow-hidden group
          ${index % 2 === 0 ? 'bg-white dark:bg-gray-900' : 'bg-gray-50 dark:bg-gray-900/50'}
          transform hover:scale-[1.01] hover:shadow-lg
          border-l-4 ${reservation.status === 'confirmed' ? 'border-l-emerald-500' : 
                     reservation.status === 'cancelled' ? 'border-l-red-500' : 
                     'border-l-amber-500'}`}
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-primary/10 to-transparent -rotate-45 transform translate-x-12 -translate-y-12 group-hover:translate-x-10 group-hover:-translate-y-10 transition-transform duration-300" />
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center bg-primary/5 p-4 rounded-xl">
              <Clock className="h-5 w-5 text-primary mb-1" />
              <span className="text-sm font-medium">{formattedTime}</span>
            </div>

            <div>
              <div className="font-medium text-lg flex items-center gap-2 mb-2">
                {reservation.customer_name}
                {reservation.section_name && (
                  <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                    <Building2 className="h-3 w-3 mr-1" />
                    {reservation.section_name}
                  </Badge>
                )}
                {/* Bölüm özellikleri */}
                {getSectionFeatures(reservation).map((feature, i) => (
                  <Badge key={i} className={feature.color}>
                    {feature.label}
                  </Badge>
                ))}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-4 mt-1">
                {reservation.customer_phone && (
                  <span className="flex items-center gap-1 hover:text-primary transition-colors">
                    <Phone className="h-3 w-3" />
                    {reservation.customer_phone}
                  </span>
                )}
                {reservation.table_name && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {reservation.table_name} ({reservation.table_capacity} Kişilik)
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {reservation.party_size} Kişi
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge className={getStatusColor(reservation.status)}>
              {reservation.status === 'confirmed' ? 'Onaylandı' : 
               reservation.status === 'cancelled' ? 'İptal' : 'Bekliyor'}
            </Badge>
            <ReservationActions reservation={reservation} onEdit={onEdit} />
          </div>
        </div>

        {reservation.notes && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>{reservation.notes}</p>
          </div>
        )}

        <div className="absolute bottom-4 right-4">
          <CountdownTimer 
            reservationDate={reservation.reservation_date}
            reservationTime={reservation.reservation_time}
          />
        </div>
      </Card>
    </motion.div>
  );
}
