"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, ClockIcon, UsersIcon, TableIcon, PhoneIcon, MailIcon, NotebookIcon, StarIcon, Cigarette, Cloud, Crown } from "lucide-react";
import { format, parseISO } from "date-fns";
import { tr } from "date-fns/locale";
import { ReservationActions } from "./ReservationActions";
import { ReservationFormModal } from "./ReservationFormModal";
import { CountdownTimer } from "./CountdownTimer";
import api from '@/lib/axios';
import { motion } from "framer-motion";
import cn from 'classnames';

// PostgreSQL'deki reservation tablosu için type
export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  tableId: number;
  tableName: string;
  tableCapacity: number;
  tableStatus: string;
  sectionName: string;
  sectionDescription: string | null;
  status: 'confirmed' | 'pending' | 'awaiting_payment' | 'payment_received' | 'customer_arrived' | 'customer_no_show' | 'customer_cancelled';
  notes: string | null;
  specialnotes: string | null;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean;
}

interface ReservationCardProps {
  reservation: Reservation;
  index: number;
  onEdit: (reservation: any) => void;
  onUpdate?: () => void; // Add this to allow parent to refresh list
}

const getStatusStyles = (status: string) => {
  switch (status) {
    case 'confirmed':
      return {
        border: 'border-l-4 border-green-500',
        background: 'bg-gradient-to-r from-green-50 to-white dark:from-green-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(34,197,94,0.1)]'
      };
    case 'pending':
      return {
        border: 'border-l-4 border-yellow-500',
        background: 'bg-gradient-to-r from-yellow-50 to-white dark:from-yellow-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.1)]'
      };
    case 'awaiting_payment':
      return {
        border: 'border-l-4 border-blue-500',
        background: 'bg-gradient-to-r from-blue-50 to-white dark:from-blue-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.1)]'
      };
    case 'payment_received':
      return {
        border: 'border-l-4 border-purple-500',
        background: 'bg-gradient-to-r from-purple-50 to-white dark:from-purple-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.1)]'
      };
    case 'customer_arrived':
      return {
        border: 'border-l-4 border-emerald-500',
        background: 'bg-gradient-to-r from-emerald-50 to-white dark:from-emerald-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.1)]'
      };
    case 'customer_no_show':
      return {
        border: 'border-l-4 border-red-500',
        background: 'bg-gradient-to-r from-red-50 to-white dark:from-red-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(239,68,68,0.1)]'
      };
    case 'customer_cancelled':
      return {
        border: 'border-l-4 border-rose-500',
        background: 'bg-gradient-to-r from-rose-50 to-white dark:from-rose-900/10 dark:to-gray-800',
        shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.1)]'
      };
    default:
      return {
        border: 'border-l-4 border-gray-500',
        background: 'bg-white dark:bg-gray-800',
        shadow: 'shadow-sm'
      };
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'Onaylandı';
    case 'pending':
      return 'Onay Bekliyor';
    case 'awaiting_payment':
      return 'Ödeme Bekleniyor';
    case 'payment_received':
      return 'Ödeme Geldi';
    case 'customer_arrived':
      return 'Müşteri Geldi';
    case 'customer_no_show':
      return 'Müşteri Gelmedi';
    case 'customer_cancelled':
      return 'Müşteri İptal Etti';
    default:
      return status;
  }
};

export function ReservationCard({ reservation, index, onEdit, onUpdate }: ReservationCardProps) {
  const [showEditForm, setShowEditForm] = useState(false);

  // Return null or loading state if reservation is not fully loaded
  if (!reservation || !reservation.status) {
    return null; // or return a loading skeleton
  }

  const statusStyles = getStatusStyles(reservation.status);

  // Tarih ve saat formatlaması
  const formattedDate = reservation.reservationDate ? 
    format(parseISO(reservation.reservationDate), 'dd MMMM yyyy', { locale: tr }) : 
    '';
  const formattedTime = reservation.reservationTime ? 
    reservation.reservationTime.slice(0, 5) : // HH:mm formatına çevirme
    '';

  const handleEdit = () => {
    console.log('Original reservation:', reservation);
    console.log('Reservation date:', reservation.reservationDate);
    
    // Format date to YYYY-MM-DD without timezone conversion
    const dateStr = reservation.reservationDate;
    console.log('Date string to send:', dateStr);
    
    const editData = {
      id: reservation.id,
      customer_name: reservation.customerName,
      customer_phone: reservation.customerPhone,
      customer_email: reservation.customerEmail,
      party_size: reservation.guestCount,
      reservation_date: dateStr,
      reservation_time: reservation.reservationTime,
      table_id: reservation.tableId,
      table_name: reservation.tableName,
      table_capacity: reservation.tableCapacity,
      table_status: reservation.tableStatus,
      section_name: reservation.sectionName,
      section_description: reservation.sectionDescription,
      status: reservation.status,
      notes: reservation.notes,
      specialnotes: reservation.specialnotes,
      is_smoking: reservation.is_smoking,
      is_outdoor: reservation.is_outdoor,
      is_vip: reservation.is_vip
    };
    
    console.log('Edit Data being sent to modal:', editData);
    onEdit(editData);
    setShowEditForm(true);
  };

  const handleUpdate = async () => {
    try {
      // Fetch updated reservation data
      const response = await api.get(`/api/postgres/get-reservation?reservationId=${reservation.id}`);
      console.log('Fetched updated reservation:', response.data);
      
      // Call parent's onUpdate if provided
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error fetching updated reservation:', error);
    }
  };

  const handleClose = () => {
    setShowEditForm(false);
  };

  return (
    <>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          delay: index * 0.1,
          type: "spring",
          stiffness: 100,
          damping: 15
        }}
        className={`relative rounded-2xl ${statusStyles.border} ${statusStyles.background} ${statusStyles.shadow} 
          backdrop-blur-[20px] hover:shadow-lg transition-all duration-300 mb-6
          border border-gray-100 dark:border-gray-700 overflow-hidden
          before:content-[''] before:absolute before:inset-0 before:z-0 before:bg-gradient-to-br before:from-white/40 before:to-white/10 
          before:dark:from-gray-800/40 before:dark:to-gray-800/10 before:pointer-events-none`}
      >
        <div className="flex items-stretch relative z-10">
          {/* Sol taraftaki saat bölümü */}
          <div className="flex-shrink-0 w-28 bg-gradient-to-br from-white/80 to-white/40 dark:from-gray-800/80 dark:to-gray-800/40 rounded-l-2xl backdrop-blur-sm border-r border-gray-100 dark:border-gray-700">
            <div className="h-full flex flex-col items-center justify-center p-4">
              <div className="rounded-full bg-gradient-to-br from-gray-100 to-white dark:from-gray-700 dark:to-gray-800 p-3 mb-2">
                <ClockIcon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
              </div>
              <div className="text-center">
                <span className="text-xl font-bold bg-gradient-to-br from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ taraftaki içerik bölümü */}
          <div className="flex-1 p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-200 dark:to-gray-300 bg-clip-text text-transparent mb-2">
                  {reservation.customerName}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <PhoneIcon className="w-4 h-4 mr-2 text-gray-500" />
                    {reservation.customerPhone}
                  </div>
                  {reservation.customerEmail && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MailIcon className="w-4 h-4 mr-2 text-gray-500" />
                      {reservation.customerEmail}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge 
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-lg shadow-sm',
                    {
                      'bg-green-50 text-green-800 border border-green-100': reservation.status === 'confirmed',
                      'bg-yellow-50 text-yellow-800 border border-yellow-100': reservation.status === 'pending',
                      'bg-blue-50 text-blue-800 border border-blue-100': reservation.status === 'awaiting_payment',
                      'bg-purple-50 text-purple-800 border border-purple-100': reservation.status === 'payment_received',
                      'bg-emerald-50 text-emerald-800 border border-emerald-100': reservation.status === 'customer_arrived',
                      'bg-red-50 text-red-800 border border-red-100': reservation.status === 'customer_no_show',
                      'bg-rose-50 text-rose-800 border border-rose-100': reservation.status === 'customer_cancelled',
                    }
                  )}
                >
                  {getStatusLabel(reservation.status)}
                </Badge>
                <ReservationActions 
                  reservationId={reservation.id}
                  onEdit={handleEdit}
                  onUpdate={onUpdate}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <CalendarIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tarih</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{formattedDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <UsersIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Kişi Sayısı</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{reservation.guestCount} Kişi</div>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                <TableIcon className="w-4 h-4 text-gray-500" />
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Masa</div>
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-200">{reservation.tableName}</div>
                </div>
              </div>
            </div>

            {(reservation.notes || reservation.specialnotes) && (
              <div className="space-y-3">
                {reservation.notes && (
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center">
                      <NotebookIcon className="w-4 h-4 text-gray-500 mr-2" />
                      Notlar
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">
                      {reservation.notes}
                    </p>
                  </div>
                )}
                {reservation.specialnotes && (
                  <div className="p-2 rounded-lg bg-white/50 dark:bg-gray-800/50">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-1 flex items-center">
                      <StarIcon className="w-4 h-4 text-gray-500 mr-2" />
                      Özel İstekler
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line pl-6">
                      {reservation.specialnotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Countdown Timer */}
            <div className="absolute bottom-5 right-5">
              <CountdownTimer 
                reservationDate={reservation.reservationDate}
                reservationTime={reservation.reservationTime}
              />
            </div>

            {/* Özel Alan Etiketleri */}
            {(reservation.is_smoking || reservation.is_outdoor || reservation.is_vip) && (
              <div className="absolute bottom-5 left-5 flex gap-2">
                {reservation.is_smoking && (
                  <Badge className="bg-orange-50 text-orange-700 border border-orange-100 px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1">
                    <Cigarette className="w-3 h-3" />
                    <span>Sigara</span>
                  </Badge>
                )}
                {reservation.is_outdoor && (
                  <Badge className="bg-sky-50 text-sky-700 border border-sky-100 px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1">
                    <Cloud className="w-3 h-3" />
                    <span>Açık Alan</span>
                  </Badge>
                )}
                {reservation.is_vip && (
                  <Badge className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-1 text-xs font-medium rounded-md flex items-center gap-1">
                    <Crown className="w-3 h-3" />
                    <span>VIP</span>
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <ReservationFormModal 
        isOpen={showEditForm} 
        onClose={handleClose}
        initialData={{
          id: reservation.id,
          customer_name: reservation.customerName,
          customer_phone: reservation.customerPhone,
          customer_email: reservation.customerEmail,
          party_size: reservation.guestCount,
          reservation_date: reservation.reservationDate,
          reservation_time: reservation.reservationTime,
          table_id: reservation.tableId,
          table_name: reservation.tableName,
          table_capacity: reservation.tableCapacity,
          table_status: reservation.tableStatus,
          section_name: reservation.sectionName,
          section_description: reservation.sectionDescription,
          status: reservation.status,
          notes: reservation.notes,
          specialnotes: reservation.specialnotes,
          is_smoking: reservation.is_smoking,
          is_outdoor: reservation.is_outdoor,
          is_vip: reservation.is_vip
        }}
        onUpdate={onUpdate}  // Pass onUpdate to modal as well
      />
    </>
  );
}
