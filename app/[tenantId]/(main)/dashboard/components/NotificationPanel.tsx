"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Calendar, Users, Clock, CalendarX, CalendarCheck, CalendarClock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

interface NotificationPanelProps {
    settings: any;
    refreshTrigger: number;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'new' | 'update' | 'cancel' | 'noshow';
    read: boolean;
    customerName: string;
    personCount: number;
    reservationTime: string;
    branchName: string;
}

// Mock rezervasyon verileri
const mockReservations: Notification[] = [
    {
        id: 'res1',
        title: 'Yeni Rezervasyon',
        message: '4 kişilik rezervasyon oluşturuldu',
        time: '5 dakika önce',
        type: 'new',
        read: false,
        customerName: 'Ahmet Yılmaz',
        personCount: 4,
        reservationTime: '19:00',
        branchName: 'Üst Kat Teras'
    },
    {
        id: 'res2',
        title: 'Rezervasyon İptali',
        message: '6 kişilik rezervasyon iptal edildi',
        time: '15 dakika önce',
        type: 'cancel',
        read: false,
        customerName: 'Mehmet Demir',
        personCount: 6,
        reservationTime: '20:30',
        branchName: 'Alt Kat Salon'
    },
    {
        id: 'res3',
        title: 'Rezervasyon Güncellemesi',
        message: 'Kişi sayısı güncellendi: 3 → 5',
        time: '30 dakika önce',
        type: 'update',
        read: true,
        customerName: 'Ayşe Kaya',
        personCount: 5,
        reservationTime: '18:30',
        branchName: 'Bahçe'
    },
    {
        id: 'res4',
        title: 'Gelmedi Bildirimi',
        message: '2 kişilik rezervasyon gelmedi',
        time: '1 saat önce',
        type: 'noshow',
        read: true,
        customerName: 'Can Özkan',
        personCount: 2,
        reservationTime: '13:00',
        branchName: 'VIP Salon'
    }
];

export default function NotificationPanel({ refreshTrigger }: NotificationPanelProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        // Mock verileri yükle ve okunmamış bildirimleri üste al
        const sortedNotifications = [...mockReservations].sort((a, b) => {
            if (a.read !== b.read) return a.read ? 1 : -1;
            return 0;
        });
        setNotifications(sortedNotifications);
    }, [refreshTrigger]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'new':
                return <Calendar className="h-4 w-4 text-green-500" />;
            case 'update':
                return <CalendarClock className="h-4 w-4 text-blue-500" />;
            case 'cancel':
                return <CalendarX className="h-4 w-4 text-red-500" />;
            case 'noshow':
                return <CalendarCheck className="h-4 w-4 text-yellow-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const getNotificationColor = (type: string) => {
        switch (type) {
            case 'new':
                return "from-green-600 to-emerald-600";
            case 'update':
                return "from-blue-600 to-indigo-600";
            case 'cancel':
                return "from-red-600 to-rose-600";
            case 'noshow':
                return "from-yellow-600 to-amber-600";
            default:
                return "from-gray-600 to-gray-600";
        }
    };

    const renderNotification = useCallback((notification: Notification) => {
        const gradient = getNotificationColor(notification.type);
        const bgGradient = notification.read ? "from-gray-50 to-gray-50/50 dark:from-gray-900 dark:to-gray-900/50" : "from-blue-50 to-blue-50/50 dark:from-blue-950 dark:to-blue-950/50";

        return (
            <Card
                key={notification.id}
                className={cn(
                    "group relative overflow-hidden transition-all duration-300",
                    "hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-gray-900/40",
                    "hover:-translate-y-0.5",
                    "bg-gradient-to-br",
                    bgGradient,
                    "border-0",
                    "mb-4"
                )}
            >
                <div className="relative">
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b opacity-70"
                        style={{
                            backgroundImage: `linear-gradient(to bottom, var(--${gradient.split(' ')[0]}-color), var(--${gradient.split(' ')[2]}-color))`
                        }} />

                    <div className="pl-3 pr-3 py-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">
                                {notification.title}
                            </span>
                            {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex items-start gap-2.5">
                            <Avatar className={cn(
                                "w-8 h-8 text-xs relative transition-all duration-300",
                                "group-hover:scale-110",
                                "bg-gradient-to-br shadow-md",
                                gradient,
                                "text-white flex items-center justify-center"
                            )}>
                                <span className="font-medium">
                                    {notification.customerName.charAt(0)}
                                </span>
                            </Avatar>

                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium">
                                        {notification.customerName}
                                    </span>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            <span>{notification.personCount} Kişi</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{notification.reservationTime}</span>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground">
                                        {notification.branchName}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 text-xs text-right text-muted-foreground">
                            {notification.time}
                        </div>
                    </div>
                </div>
            </Card>
        );
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Rezervasyon Bildirimleri</h3>
                <span className="text-xs text-muted-foreground">
                    {notifications.filter(n => !n.read).length} yeni bildirim
                </span>
            </div>

            <div className="space-y-2">
                {notifications.map(notification => renderNotification(notification))}
            </div>
        </div>
    );
}