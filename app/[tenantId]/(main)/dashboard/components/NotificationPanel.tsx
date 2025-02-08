"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Info, AlertCircle, CheckCircle, XCircle, Users2, Clock, LayoutGrid, Table } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { useReservationStore } from "@/stores/reservation-store";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    title: string;
    description: string;
    date: Date;
    read: boolean;
    type: 'info' | 'warning' | 'success' | 'error';
}

interface NotificationPanelProps {
    isLoading?: boolean;
}

export default function NotificationPanel({ isLoading = false }: NotificationPanelProps) {
    const { reservations } = useReservationStore();

    // Son 7 rezervasyonu al ve bildirimlere dönüştür
    const notifications: Notification[] = reservations
        .sort((a, b) => new Date(b.reservationDate).getTime() - new Date(a.reservationDate).getTime())
        .slice(0, 7)
        .map(reservation => {
            // Tarih ve saat bilgisini birleştir
            const timeMatch = reservation.reservationTime?.match(/(\d{2}):(\d{2})/);
            if (!timeMatch) {
                console.error('Invalid time format:', reservation.reservationTime);
                return null;
            }

            const [_, hours, minutes] = timeMatch;
            const reservationDate = new Date(reservation.reservationDate);
            
            // UTC'den yerel saate çevir
            const localDate = new Date(reservationDate.getTime() + reservationDate.getTimezoneOffset() * 60000);
            localDate.setHours(parseInt(hours), parseInt(minutes));
            
            // Rezervasyon durumuna göre bildirim tipini belirle
            let type: 'info' | 'warning' | 'success' | 'error' = 'info';
            switch (reservation.status) {
                case 'confirmed':
                case 'payment_received':
                case 'customer_arrived':
                    type = 'success';
                    break;
                case 'pending':
                case 'awaiting_payment':
                    type = 'warning';
                    break;
                case 'customer_cancelled':
                case 'customer_no_show':
                    type = 'error';
                    break;
            }

            // Rezervasyon durumuna göre başlık belirle
            let title = '';
            switch (reservation.status) {
                case 'confirmed':
                    title = 'Yeni Onaylanan Rezervasyon';
                    break;
                case 'pending':
                    title = 'Onay Bekleyen Rezervasyon';
                    break;
                case 'awaiting_payment':
                    title = 'Ödeme Bekleyen Rezervasyon';
                    break;
                case 'payment_received':
                    title = 'Ödemesi Alınan Rezervasyon';
                    break;
                case 'customer_arrived':
                    title = 'Müşteri Geldi';
                    break;
                case 'customer_no_show':
                    title = 'Müşteri Gelmedi';
                    break;
                case 'customer_cancelled':
                    title = 'Müşteri İptal Etti';
                    break;
            }

            // Detaylı açıklama oluştur
            const description = [
                reservation.customerName,
                `${reservation.guestCount} Kişi`,
                format(localDate, 'HH:mm', { locale: tr }),
                reservation.sectionName,
                reservation.tableName
            ].filter(Boolean).join(' • ');

            return {
                id: reservation.id,
                title,
                description,
                date: localDate,
                read: false,
                type
            };
        })
        .filter(Boolean); // null değerleri filtrele

    const renderNotification = (notification: Notification) => {
        const statusColor = {
            info: 'text-blue-600 dark:text-blue-400',
            warning: 'text-yellow-600 dark:text-yellow-400',
            success: 'text-green-600 dark:text-green-400',
            error: 'text-red-600 dark:text-red-400'
        }[notification.type];

        const bgColor = {
            info: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10',
            warning: 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10',
            success: 'bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-800/10',
            error: 'bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10'
        }[notification.type];

        const icon = {
            info: <Info className="h-5 w-5" />,
            warning: <AlertCircle className="h-5 w-5" />,
            success: <CheckCircle className="h-5 w-5" />,
            error: <XCircle className="h-5 w-5" />
        }[notification.type];

        // Açıklama parçalarını ayır
        const [customerName, guestCount, time, sectionName, tableName] = notification.description.split('•').map(s => s.trim());

        return (
            <Card
                key={notification.id}
                className={cn(
                    "group relative overflow-hidden transition-all duration-200",
                    "hover:shadow-lg dark:hover:shadow-black/30",
                    "hover:-translate-y-0.5",
                    "mb-3",
                    bgColor
                )}
            >
                <div className="absolute top-0 right-0 p-2">
                    <time className="text-xs font-medium text-muted-foreground bg-background/80 rounded-md px-2 py-1 backdrop-blur-sm">
                        {format(notification.date, 'dd MMM', { locale: tr })}
                    </time>
                </div>

                <div className="p-4">
                    <div className="flex items-start gap-4">
                        <div className={cn(
                            "rounded-full p-2 transition-colors duration-200",
                            "bg-background/80 backdrop-blur-sm shadow-sm",
                            statusColor,
                            "group-hover:scale-110"
                        )}>
                            {icon}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex flex-col gap-2">
                                <div>
                                    <h4 className={cn(
                                        "text-sm font-semibold mb-1",
                                        statusColor
                                    )}>
                                        {notification.title}
                                    </h4>
                                    <div className="text-base font-medium">
                                        {customerName}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Users2 className="h-4 w-4 text-muted-foreground" />
                                        <span>{guestCount}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        <span>{time}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                                        <span>{sectionName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Table className="h-4 w-4 text-muted-foreground" />
                                        <span>{tableName}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    const renderSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="relative overflow-hidden mb-3">
                    <div className="p-4">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                            <div className="flex-1">
                                <div className="space-y-3">
                                    <div className="h-4 w-1/3 bg-muted rounded animate-pulse" />
                                    <div className="h-4 w-2/3 bg-muted rounded animate-pulse" />
                                    <div className="grid grid-cols-2 gap-2">
                                        {[1, 2, 3, 4].map((j) => (
                                            <div key={j} className="h-4 w-20 bg-muted rounded animate-pulse" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-xl font-semibold tracking-tight">
                        Rezervasyon Bildirimleri
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {isLoading ? (
                            <span className="h-4 w-32 bg-muted rounded animate-pulse inline-block" />
                        ) : (
                            `Son ${notifications.length} rezervasyon aktivitesi`
                        )}
                    </p>
                </div>
                <Badge 
                    variant="secondary" 
                    className={cn(
                        "px-2.5 py-1.5 text-sm font-medium",
                        !isLoading && notifications.some(n => !n.read) && "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                    )}
                >
                    {isLoading ? (
                        <span className="h-4 w-8 bg-muted rounded animate-pulse inline-block" />
                    ) : (
                        `${notifications.filter(n => !n.read).length} yeni`
                    )}
                </Badge>
            </div>

            {isLoading ? renderSkeleton() : (
                <div className="space-y-2">
                    {notifications.map(notification => renderNotification(notification))}
                </div>
            )}
        </div>
    );
}