"use client";

import { useEffect, useState } from "react";
import { useFilterStore } from "@/stores/filters-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useTabStore } from "@/stores/tab-store";
import { useReservationStore } from "@/stores/reservation-store";
import { Bell, Store } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CalendarCheck, CalendarX, Calendar, TrendingUp, UserCheck } from "lucide-react";
import { motion } from "framer-motion";
import NotificationPanel from "@/app/[tenantId]/(main)/dashboard/components/NotificationPanel";
import { ReservationCalendar } from "../reports/components/ReservationCalendar";
import cn from "classnames";
import { format } from "date-fns";

const REFRESH_INTERVAL = 90000; // 90 seconds in milliseconds

interface StatCard {
    title: string;
    value: string;
    description: string;
    icon: React.ReactNode;
    trend: number;
}

export default function Dashboard() {
    const { activeTab } = useTabStore();
    const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
    const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { settings } = useSettingsStore();
    const { selectedFilter } = useFilterStore();
    const [stats, setStats] = useState<StatCard[]>([]);
    const { fetchReservations, fetchTables, reservations } = useReservationStore();

    // API'den gelen verileri işleyerek istatistikleri hesapla
    const calculateStats = () => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Pazartesi
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Bugünün rezervasyonları
        const todayReservations = reservations.filter(r => {
            const reservationDate = new Date(r.reservationDate);
            return format(reservationDate, 'yyyy-MM-dd') === format(startOfToday, 'yyyy-MM-dd');
        });

        // Bu haftanın rezervasyonları
        const weekReservations = reservations.filter(r => {
            const reservationDate = new Date(r.reservationDate);
            return reservationDate >= startOfWeek && reservationDate < now;
        });

        // Bu ayın rezervasyonları
        const monthReservations = reservations.filter(r => {
            const reservationDate = new Date(r.reservationDate);
            return reservationDate >= startOfMonth && reservationDate < now;
        });

        // Onaylanan rezervasyonlar (confirmed veya payment_received veya customer_arrived)
        const confirmedReservations = monthReservations.filter(r => 
            r.status === 'confirmed' || 
            r.status === 'payment_received' || 
            r.status === 'customer_arrived'
        );

        // İptal olan veya gelmeyen rezervasyonlar (customer_cancelled veya customer_no_show)
        const cancelledReservations = monthReservations.filter(r => 
            r.status === 'customer_cancelled' || 
            r.status === 'customer_no_show'
        );

        // Bekleyen rezervasyonlar (pending veya awaiting_payment)
        const pendingReservations = monthReservations.filter(r => 
            r.status === 'pending' || 
            r.status === 'awaiting_payment'
        );

        // Toplam kişi sayıları
        const todayGuestCount = todayReservations.reduce((sum, r) => sum + r.guestCount, 0);
        const weekGuestCount = weekReservations.reduce((sum, r) => sum + r.guestCount, 0);
        const monthGuestCount = monthReservations.reduce((sum, r) => sum + r.guestCount, 0);
        const cancelledGuestCount = cancelledReservations.reduce((sum, r) => sum + r.guestCount, 0);

        // Ortalama kişi sayısı
        const averageGuestCount = monthReservations.length > 0 
            ? (monthGuestCount / monthReservations.length).toFixed(1)
            : "0";

        // Onay oranı (onaylananlar / (toplam - bekleyenler))
        const confirmationRate = monthReservations.length - pendingReservations.length > 0
            ? Math.round((confirmedReservations.length / (monthReservations.length - pendingReservations.length)) * 100)
            : 0;

        const newStats: StatCard[] = [
            {
                title: "Bugünkü Rezervasyonlar",
                value: todayReservations.length.toString(),
                description: `${todayGuestCount} Kişi`,
                icon: <Calendar className="h-4 w-4 text-blue-600" />,
                trend: 0
            },
            {
                title: "Bu Hafta",
                value: weekReservations.length.toString(),
                description: `${weekGuestCount} Kişi`,
                icon: <Users className="h-4 w-4 text-green-600" />,
                trend: 0
            },
            {
                title: "Bu Ay",
                value: monthReservations.length.toString(),
                description: `${monthGuestCount} Kişi`,
                icon: <TrendingUp className="h-4 w-4 text-purple-600" />,
                trend: 0
            },
            {
                title: "Onaylanan Rezervasyonlar",
                value: `${confirmationRate}%`,
                description: `${confirmedReservations.length}/${monthReservations.length - pendingReservations.length} Rezervasyon`,
                icon: <CalendarCheck className="h-4 w-4 text-emerald-600" />,
                trend: 0
            },
            {
                title: "İptal/Gelmeyen",
                value: cancelledReservations.length.toString(),
                description: `${cancelledGuestCount} Kişi`,
                icon: <CalendarX className="h-4 w-4 text-red-600" />,
                trend: 0
            },
            {
                title: "Ortalama Kişi Sayısı",
                value: averageGuestCount,
                description: "Rezervasyon Başına",
                icon: <UserCheck className="h-4 w-4 text-orange-600" />,
                trend: 0
            }
        ];

        setStats(newStats);
    };

    useEffect(() => {
        if (selectedFilter.branches) {
            setSelectedBranches(selectedFilter.branches.map(item => item.BranchID));
        }
    }, [selectedFilter]);

    useEffect(() => {
        if (activeTab === "dashboard") {
            const countdownInterval = setInterval(() => {
                setCountdown((prevCount) => {
                    if (prevCount <= 1) {
                        setRefreshTrigger(prev => prev + 1);
                        return REFRESH_INTERVAL / 1000;
                    }
                    return prevCount - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }
    }, [activeTab]);

    useEffect(() => {
        if (selectedBranches.length > 0) {
            fetchReservations(selectedBranches);
            fetchTables(selectedBranches);
        }
    }, [selectedBranches, fetchReservations, fetchTables]);

    useEffect(() => {
        if (selectedBranches.length > 0) {
            fetchReservations(selectedBranches);
            fetchTables(selectedBranches);
        }
    }, [refreshTrigger, selectedBranches, fetchReservations, fetchTables]);

    useEffect(() => {
        calculateStats();
    }, [reservations]);

    return (
        <div className="h-full flex">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent 
                [&::-webkit-scrollbar]:w-2
                [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                [&::-webkit-scrollbar-thumb]:rounded-full
                [&::-webkit-scrollbar-track]:bg-transparent
                dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                <div className="flex justify-between items-center py-3 px-3 bg-background/95 backdrop-blur-sm border-b border-border/60 sticky top-0 z-10">
                    <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                        <Store className="h-5 w-5 text-blue-500" />
                        <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Rezervasyon İstatistikleri
                        </span>
                    </h2>
                    <div className="bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2 text-sm text-muted-foreground text-start flex items-center gap-2 group">
                        <div className="duration-[8000ms] text-blue-500 group-hover:text-blue-600 [animation:spin_6s_linear_infinite]">
                            <svg
                                className="h-4 w-4"
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M5 22h14" />
                                <path d="M5 2h14" />
                                <path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" />
                                <path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" />
                            </svg>
                        </div>
                        <span className="font-medium w-4 text-center">{countdown}</span>
                        <span>saniye</span>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* İstatistik Kartları */}
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                            >
                                <Card className="group hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            {stat.title}
                                        </CardTitle>
                                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 group-hover:scale-110 transition-transform duration-300">
                                            {stat.icon}
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                                            {stat.value}
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <p className="text-xs text-muted-foreground">
                                                {stat.description}
                                            </p>
                                            <span className={cn(
                                                "text-xs font-medium px-1.5 py-0.5 rounded-full",
                                                stat.trend > 0 
                                                    ? "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
                                                    : "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400"
                                            )}>
                                                {stat.trend > 0 ? '+' : ''}{stat.trend}%
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Rezervasyon Takvimi */}
                    <motion.div
                        className="space-y-6"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Rezervasyon Takvimi
                                </span>
                            </h2>
                        </div>
                        <Card className="overflow-hidden border-0 shadow-lg shadow-blue-500/5">
                            <CardContent className="p-0">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/50 dark:to-indigo-950/20">
                                    <ReservationCalendar />
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>

            <div className="hidden lg:block w-[300px] border-l border-border/60 bg-background/95 backdrop-blur-sm">
                <div className="h-full p-3 overflow-y-auto
                [&::-webkit-scrollbar]:w-2
                        [&::-webkit-scrollbar-thumb]:bg-gray-300/50
                        [&::-webkit-scrollbar-thumb]:rounded-full
                        [&::-webkit-scrollbar-track]:bg-transparent
                        dark:[&::-webkit-scrollbar-thumb]:bg-gray-700/50
                        hover:[&::-webkit-scrollbar-thumb]:bg-gray-300/80
                        dark:hover:[&::-webkit-scrollbar-thumb]:bg-gray-700/80">
                    <NotificationPanel
                        settings={settings}
                        refreshTrigger={refreshTrigger}
                    />
                </div>
            </div>

            <div className="fixed bottom-4 right-4 lg:hidden z-40">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button size="icon" className="rounded-full h-12 w-12">
                            <div className="relative">
                                <Bell className="h-5 w-5" />
                                <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                            </div>
                        </Button>
                    </SheetTrigger>
                    <SheetContent
                        side="right"
                        className="w-[90%] max-w-[400px] p-0 sm:w-[400px]"
                    >
                        <NotificationPanel
                            settings={settings}
                            refreshTrigger={refreshTrigger}
                        />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
