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
          backdrop-blur-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 mb-6`}
      >
        <div className="flex items-stretch">
          {/* Sol taraftaki saat bölümü */}
          <div className="flex-shrink-0 w-28 bg-white/50 dark:bg-gray-800/50 rounded-l-2xl backdrop-blur-sm">
            <div className="h-full flex flex-col items-center justify-center p-4">
              <ClockIcon className="w-6 h-6 text-gray-400 mb-2" />
              <div className="text-center">
                <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                  {formattedTime}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ taraftaki içerik bölümü */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent mb-2">
                  {reservation.customerName}
                </h3>
                <div className="space-y-1.5">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    <PhoneIcon className="w-4 h-4 mr-2" />
                    {reservation.customerPhone}
                  </div>
                  {reservation.customerEmail && (
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                      <MailIcon className="w-4 h-4 mr-2" />
                      {reservation.customerEmail}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge 
                  className={cn(
                    'border-0 px-3 py-1 text-xs font-medium rounded-full ring-2',
                    {
                      'bg-green-100 text-green-800 ring-green-400/20': reservation.status === 'confirmed',
                      'bg-yellow-100 text-yellow-800 ring-yellow-400/20': reservation.status === 'pending',
                      'bg-blue-100 text-blue-800 ring-blue-400/20': reservation.status === 'awaiting_payment',
                      'bg-purple-100 text-purple-800 ring-purple-400/20': reservation.status === 'payment_received',
                      'bg-emerald-100 text-emerald-800 ring-emerald-400/20': reservation.status === 'customer_arrived',
                      'bg-red-100 text-red-800 ring-red-400/20': reservation.status === 'customer_no_show',
                      'bg-rose-100 text-rose-800 ring-rose-400/20': reservation.status === 'customer_cancelled',
                    }
                  )}
                >
                  {getStatusLabel(reservation.status)}
                </Badge>
                <ReservationActions 
                  reservationId={reservation.id}
                  onEdit={handleEdit}
                  onUpdate={onUpdate}  // Pass onUpdate to ReservationActions
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors group">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
                  <CalendarIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Tarih</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{formattedDate}</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors group">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
                  <UsersIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Kişi Sayısı</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{reservation.guestCount} Kişi</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors group">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg group-hover:scale-110 transition-transform">
                  <TableIcon className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Masa</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{reservation.tableName}</div>
                </div>
              </div>
            </div>

            {(reservation.notes || reservation.specialnotes) && (
              <div className="space-y-4">
                {reservation.notes && (
                  <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <NotebookIcon className="w-4 h-4 mr-2" />
                      Notlar
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {reservation.notes}
                    </p>
                  </div>
                )}
                {reservation.specialnotes && (
                  <div className="p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center">
                      <StarIcon className="w-4 h-4 mr-2" />
                      Özel İstekler
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-line">
                      {reservation.specialnotes}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Countdown Timer */}
            <div className="absolute bottom-6 right-6">
              <CountdownTimer 
                reservationDate={reservation.reservationDate}
                reservationTime={reservation.reservationTime}
              />
            </div>

            {/* Özel Alan Etiketleri */}
            {(reservation.is_smoking || reservation.is_outdoor || reservation.is_vip) && (
              <div className="absolute bottom-6 left-6 flex gap-2">
                {reservation.is_smoking && (
                  <Badge className="bg-orange-100 text-orange-800 border-0 px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-orange-400/30 flex items-center gap-1 group transition-all duration-300 hover:ring-2">
                    <Cigarette className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    <span>Sigara</span>
                  </Badge>
                )}
                {reservation.is_outdoor && (
                  <Badge className="bg-sky-100 text-sky-800 border-0 px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-sky-400/30 flex items-center gap-1 group transition-all duration-300 hover:ring-2">
                    <Cloud className="w-3 h-3 group-hover:scale-110 transition-transform" />
                    <span>Açık Alan</span>
                  </Badge>
                )}
                {reservation.is_vip && (
                  <Badge className="bg-purple-100 text-purple-800 border-0 px-2.5 py-0.5 text-xs font-medium rounded-full ring-1 ring-purple-400/30 flex items-center gap-1 group transition-all duration-300 hover:ring-2">
                    <Crown className="w-3 h-3 group-hover:scale-110 transition-transform" />
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
