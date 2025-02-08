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
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { settings } = useSettingsStore();
    const { selectedFilter } = useFilterStore();
    const [stats, setStats] = useState<StatCard[]>([]);
    const { fetchInitialData, reservations, isLoading } = useReservationStore();

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
        if (activeTab === "dashboard") {
            fetchInitialData();
            
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
        if (activeTab === "dashboard" && refreshTrigger > 0) {
            fetchInitialData();
        }
    }, [activeTab, refreshTrigger]);

    useEffect(() => {
        calculateStats();
    }, [reservations]);

    if (isLoading) {
        return (
            <div className="h-full flex flex-col">
                <div className="flex justify-between items-center py-3 px-3 bg-background/95 backdrop-blur-sm border-b border-border/60 sticky top-0 z-10">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-blue-500/20 dark:bg-blue-400/20 animate-pulse-soft" />
                        <div className="h-8 w-64 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-md animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 bg-card/95 backdrop-blur-sm border border-border/60 rounded-lg px-3 py-2">
                        <div className="h-4 w-4 rounded-full bg-blue-500/20 dark:bg-blue-400/20 animate-spin" />
                        <div className="h-4 w-16 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse" />
                    </div>
                </div>

                <div className="p-6 space-y-6 flex-1">
                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div key={index} 
                                className="relative group"
                                style={{ 
                                    animation: `fadeIn 0.5s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-indigo-500/5 dark:from-blue-500/10 dark:to-indigo-500/10 rounded-lg animate-pulse" />
                                <div className="border border-gray-200/20 dark:border-gray-700/20 rounded-lg p-6 backdrop-blur-sm relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent skeleton-wave" />
                                    
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="space-y-2">
                                            <div className="h-5 w-32 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse" />
                                            <div className="h-3 w-24 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse opacity-70" />
                                        </div>
                                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 animate-pulse-soft p-2">
                                            <div className="h-full w-full rounded-lg bg-blue-500/20 dark:bg-blue-400/20 animate-pulse" />
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex items-baseline gap-2">
                                            <div className="h-8 w-20 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse" />
                                            <div className="h-5 w-12 rounded-full bg-green-100 dark:bg-green-900 animate-pulse-soft" />
                                        </div>
                                        <div className="h-4 w-24 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded animate-pulse opacity-60" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full bg-blue-500/20 dark:bg-blue-400/20 animate-pulse-soft" />
                            <div className="h-8 w-48 bg-gradient-to-r from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-md animate-pulse" />
                        </div>
                        <div className="border border-gray-200/20 dark:border-gray-700/20 rounded-lg p-6 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-transparent skeleton-wave" />
                            <div className="h-[400px] bg-gradient-to-br from-gray-200 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg animate-pulse" />
                        </div>
                    </div>
                </div>

                <style jsx>{`
                    @keyframes fadeIn {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                `}</style>
            </div>
        );
    }

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
                        {stats.map((stat, index) => {
                            // Her kart için özel renk teması
                            const themes = {
                                0: {
                                    bg: "from-blue-50/50 to-indigo-50/20 dark:from-blue-950/30 dark:to-indigo-950/10",
                                    icon: "from-blue-100 to-indigo-50 dark:from-blue-900 dark:to-indigo-900",
                                    iconColor: "text-blue-600 dark:text-blue-400",
                                    gradient: "from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400",
                                    border: "hover:border-blue-200/30 dark:hover:border-blue-700/30"
                                },
                                1: {
                                    bg: "from-purple-50/50 to-pink-50/20 dark:from-purple-950/30 dark:to-pink-950/10",
                                    icon: "from-purple-100 to-pink-50 dark:from-purple-900 dark:to-pink-900",
                                    iconColor: "text-purple-600 dark:text-purple-400",
                                    gradient: "from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400",
                                    border: "hover:border-purple-200/30 dark:hover:border-purple-700/30"
                                },
                                2: {
                                    bg: "from-emerald-50/50 to-teal-50/20 dark:from-emerald-950/30 dark:to-teal-950/10",
                                    icon: "from-emerald-100 to-teal-50 dark:from-emerald-900 dark:to-teal-900",
                                    iconColor: "text-emerald-600 dark:text-emerald-400",
                                    gradient: "from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400",
                                    border: "hover:border-emerald-200/30 dark:hover:border-emerald-700/30"
                                },
                                3: {
                                    bg: "from-orange-50/50 to-amber-50/20 dark:from-orange-950/30 dark:to-amber-950/10",
                                    icon: "from-orange-100 to-amber-50 dark:from-orange-900 dark:to-amber-900",
                                    iconColor: "text-orange-600 dark:text-orange-400",
                                    gradient: "from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400",
                                    border: "hover:border-orange-200/30 dark:hover:border-orange-700/30"
                                },
                                4: {
                                    bg: "from-rose-50/50 to-red-50/20 dark:from-rose-950/30 dark:to-red-950/10",
                                    icon: "from-rose-100 to-red-50 dark:from-rose-900 dark:to-red-900",
                                    iconColor: "text-rose-600 dark:text-rose-400",
                                    gradient: "from-rose-600 to-red-600 dark:from-rose-400 dark:to-red-400",
                                    border: "hover:border-rose-200/30 dark:hover:border-rose-700/30"
                                },
                                5: {
                                    bg: "from-cyan-50/50 to-sky-50/20 dark:from-cyan-950/30 dark:to-sky-950/10",
                                    icon: "from-cyan-100 to-sky-50 dark:from-cyan-900 dark:to-sky-900",
                                    iconColor: "text-cyan-600 dark:text-cyan-400",
                                    gradient: "from-cyan-600 to-sky-600 dark:from-cyan-400 dark:to-sky-400",
                                    border: "hover:border-cyan-200/30 dark:hover:border-cyan-700/30"
                                }
                            };

                            const theme = themes[index % 6];

                            return (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <Card className={cn(
                                        "group overflow-hidden relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1",
                                        "dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200/20",
                                        theme.border
                                    )}>
                                        <div className={cn(
                                            "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                                            theme.bg
                                        )} />
                                        
                                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                            <CardTitle className="text-sm font-medium bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                                                {stat.title}
                                            </CardTitle>
                                            <div className={cn(
                                                "p-2.5 rounded-xl bg-gradient-to-br group-hover:scale-110 transition-all duration-300 shadow-sm",
                                                theme.icon
                                            )}>
                                                <div className={theme.iconColor}>
                                                    {stat.icon}
                                                </div>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="relative">
                                            <div className="flex items-baseline space-x-2">
                                                <div className={cn(
                                                    "text-3xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                                                    theme.gradient
                                                )}>
                                                    {stat.value}
                                                </div>
                                                {stat.trend !== 0 && (
                                                    <span className={cn(
                                                        "text-xs font-medium px-2 py-0.5 rounded-full transition-colors duration-200",
                                                        stat.trend > 0 
                                                            ? "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-950"
                                                            : "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-950"
                                                    )}>
                                                        {stat.trend > 0 ? '+' : ''}{stat.trend}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-2 flex items-center space-x-2">
                                                <p className="text-sm text-muted-foreground">
                                                    {stat.description}
                                                </p>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
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
                                    <ReservationCalendar isLoading={isLoading} />
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
                        isLoading={isLoading}
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
                            isLoading={isLoading}
                        />
                    </SheetContent>
                </Sheet>
            </div>
        </div>
    );
}
