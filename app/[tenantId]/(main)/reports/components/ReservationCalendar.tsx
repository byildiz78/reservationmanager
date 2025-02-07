"use client";

import { useState, useMemo } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { format, parse, startOfWeek, getDay, setHours, setMinutes, addDays, addWeeks, startOfMonth, isSameMonth } from "date-fns";
import { tr } from "date-fns/locale";
import { useReservationStore } from "@/stores/reservation-store";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const locales = {
  tr: tr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const getOccupancyColor = (occupancyRate: number) => {
  if (occupancyRate >= 90) return 'bg-red-100 text-red-800 border-red-300';
  if (occupancyRate >= 70) return 'bg-orange-100 text-orange-800 border-orange-300';
  if (occupancyRate >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  if (occupancyRate > 0) return 'bg-green-100 text-green-800 border-green-300';
  return 'bg-slate-50 text-slate-600 border-slate-200';
};

const getProgressColor = (occupancyRate: number) => {
  if (occupancyRate >= 90) return 'bg-red-500';
  if (occupancyRate >= 70) return 'bg-orange-500';
  if (occupancyRate >= 50) return 'bg-yellow-500';
  if (occupancyRate > 0) return 'bg-green-500';
  return 'bg-slate-200';
};

const OccupancyBar = ({ value }: { value: number }) => (
  <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
    <div 
      className={cn("h-full rounded-full transition-all", getProgressColor(value))}
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);

const getOccupancyBg = (occupancyRate: number) => {
  if (occupancyRate >= 90) return 'bg-red-50';
  if (occupancyRate >= 70) return 'bg-orange-50';
  if (occupancyRate >= 50) return 'bg-yellow-50';
  if (occupancyRate > 0) return 'bg-green-50';
  return 'bg-background';
};

interface LocationStats {
  name: string;
  reservationCount: number;
  occupancyRate: number;
  totalCapacity: number;
  timeSlots: {
    [key: string]: {
      count: number;
      reservations: any[];
    };
  };
}

interface ViewProps {
  date: Date;
  locationStats: LocationStats[];
  reservations: any[];
  tables: any[];
}

const CustomToolbar = (toolbar: any) => {
  const navigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    toolbar.onNavigate(action);
  };

  const viewNames = {
    month: 'Ay',
    week: 'Hafta',
    day: 'Gün',
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('TODAY')}
        >
          Bugün
        </Button>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('PREV')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('NEXT')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h2 className="text-lg font-semibold">
        {format(toolbar.date, 'd MMMM yyyy', { locale: tr })}
      </h2>

      <div className="flex items-center gap-2">
        {Object.entries(viewNames).map(([key, label]) => (
          <Button
            key={key}
            variant={toolbar.view === key ? "default" : "outline"}
            size="sm"
            onClick={() => toolbar.onView(key)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
};

const DailyView = ({ date, locationStats }: { date: Date; locationStats: LocationStats[] }) => {
  // Saat aralığını 11:00'dan 24:00'a kadar ayarla
  const hours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 11;
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const getTimeSlotOccupancy = (location: LocationStats, time: string) => {
    const slot = location.timeSlots[time] || { count: 0, reservations: [] };
    // Her saat dilimi için doluluk oranını hesapla
    const maxCapacityPerHour = location.totalCapacity;
    const occupancyRate = (slot.count / maxCapacityPerHour) * 100;
    return {
      ...slot,
      occupancyRate
    };
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[100px_1fr] border-b bg-muted/50">
        <div className="p-2 font-medium text-sm border-r">Saat</div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${locationStats.length}, 1fr)` }}>
          {locationStats.map((location, i) => (
            <div 
              key={i} 
              className={cn(
                "p-3 font-medium text-sm border-r last:border-r-0",
                "bg-white"
              )}
            >
              <div className="text-center">
                <div className="font-semibold mb-1">{location.name}</div>
                <div className="text-2xl font-bold text-primary">
                  {location.reservationCount}
                  <span className="text-sm font-normal text-muted-foreground ml-1">/ {location.totalCapacity}</span>
                </div>
                <div className="text-xs text-muted-foreground mt-1">Toplam Kişi</div>
                <OccupancyBar value={location.occupancyRate} />
                <div className="text-xs font-medium mt-1">
                  %{Math.round(location.occupancyRate)} Doluluk
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[100px_1fr]">
          {hours.map(time => (
            <div key={time} className="contents group">
              <div className="p-2 text-sm border-b border-r bg-muted/10 font-medium sticky left-0">
                {time}
              </div>
              <div 
                className="grid border-b" 
                style={{ gridTemplateColumns: `repeat(${locationStats.length}, 1fr)` }}
              >
                {locationStats.map((location, i) => {
                  const slotInfo = getTimeSlotOccupancy(location, time);
                  
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "relative p-2 text-xs border-r last:border-r-0 transition-colors",
                        "hover:bg-muted/5"
                      )}
                    >
                      {slotInfo.count > 0 && (
                        <>
                          <div 
                            className={cn(
                              "absolute inset-0 opacity-15 transition-opacity",
                              getProgressColor(slotInfo.occupancyRate)
                            )} 
                          />
                          <div className="relative flex items-center justify-between gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] whitespace-nowrap",
                                getOccupancyColor(slotInfo.occupancyRate)
                              )}
                            >
                              %{Math.round(slotInfo.occupancyRate)}
                            </Badge>
                            <span className="text-[10px] font-medium whitespace-nowrap">
                              {slotInfo.count} Kişi
                            </span>
                          </div>
                          <OccupancyBar value={slotInfo.occupancyRate} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const WeeklyView = ({ date, locationStats, reservations, tables }: ViewProps) => {
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(startOfWeek(date, { locale: tr }), i);
    return {
      date: day,
      label: format(day, 'EEEE', { locale: tr }),
      dayStr: format(day, 'yyyy-MM-dd')
    };
  });

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[150px_1fr] border-b bg-muted/50">
        <div className="p-2 font-medium text-sm border-r">Bölge</div>
        <div className="grid grid-cols-7">
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className="p-3 font-medium text-sm border-r last:border-r-0 text-center"
            >
              <div className="font-semibold">{day.label}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {format(day.date, 'd MMMM', { locale: tr })}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[150px_1fr]">
          {locationStats.map((location, i) => (
            <div key={i} className="contents">
              <div className="p-3 text-sm border-b border-r bg-white sticky left-0">
                <div className="font-semibold">{location.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Toplam Kapasite: {location.totalCapacity}
                </div>
              </div>
              <div className="grid grid-cols-7 border-b">
                {weekDays.map((day, j) => {
                  const dayStats = reservations
                    .filter(r => r.date === day.dayStr)
                    .filter(r => {
                      const table = tables.find(t => t.id === r.tableId);
                      return table?.location === location.name;
                    })
                    .reduce((acc, r) => acc + r.persons, 0);
                  
                  const occupancyRate = (dayStats / location.totalCapacity) * 100;

                  return (
                    <div 
                      key={j}
                      className={cn(
                        "relative p-2 text-xs border-r border-b last:border-r-0",
                        "hover:bg-muted/5"
                      )}
                    >
                      {dayStats > 0 && (
                        <>
                          <div 
                            className={cn(
                              "absolute inset-0 opacity-15 transition-opacity",
                              getProgressColor(occupancyRate)
                            )} 
                          />
                          <div className="relative flex items-center justify-between gap-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px] whitespace-nowrap",
                                getOccupancyColor(occupancyRate)
                              )}
                            >
                              %{Math.round(occupancyRate)}
                            </Badge>
                            <span className="text-[10px] font-medium whitespace-nowrap">
                              {dayStats} Kişi
                            </span>
                          </div>
                          <OccupancyBar value={occupancyRate} />
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MonthlyView = ({ date, locationStats, reservations, tables }: ViewProps) => {
  const weeks = Array.from({ length: 6 }, (_, weekIndex) => {
    const weekStart = addWeeks(startOfMonth(date), weekIndex);
    return Array.from({ length: 7 }, (_, dayIndex) => {
      const day = addDays(weekStart, dayIndex);
      return {
        date: day,
        dayStr: format(day, 'yyyy-MM-dd'),
        isCurrentMonth: isSameMonth(day, date)
      };
    });
  });

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'].map((day, i) => (
          <div 
            key={i}
            className="p-2 font-medium text-sm border-r last:border-r-0 text-center"
          >
            {day}
          </div>
        ))}
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-7">
          {weeks.flat().map((day, i) => {
            const dayStats = locationStats.map(location => {
              const reservationCount = reservations
                .filter(r => r.date === day.dayStr)
                .filter(r => {
                  const table = tables.find(t => t.id === r.tableId);
                  return table?.location === location.name;
                })
                .reduce((acc, r) => acc + r.persons, 0);
              
              return {
                ...location,
                reservationCount,
                occupancyRate: (reservationCount / location.totalCapacity) * 100
              };
            });

            const totalOccupancy = dayStats.reduce((acc, stat) => acc + stat.occupancyRate, 0) / dayStats.length;

            return (
              <div 
                key={i}
                className={cn(
                  "min-h-[120px] p-2 text-xs border-r border-b last:border-r-0",
                  "hover:bg-muted/5",
                  !day.isCurrentMonth && "opacity-50"
                )}
              >
                <div className="font-medium mb-2">
                  {format(day.date, 'd', { locale: tr })}
                </div>
                {dayStats.some(stat => stat.reservationCount > 0) && (
                  <div className="space-y-2">
                    {dayStats.map((stat, j) => (
                      stat.reservationCount > 0 && (
                        <div key={j} className="space-y-1">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] font-medium">{stat.name}</span>
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "text-[10px]",
                                getOccupancyColor(stat.occupancyRate)
                              )}
                            >
                              {stat.reservationCount}
                            </Badge>
                          </div>
                          <OccupancyBar value={stat.occupancyRate} />
                        </div>
                      )
                    ))}
                    <div className="pt-1 border-t">
                      <OccupancyBar value={totalOccupancy} />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export function ReservationCalendar() {
  const [view, setView] = useState(Views.DAY);
  const [date, setDate] = useState(new Date());
  const { reservations, tables } = useReservationStore();

  const locationStats = useMemo(() => {
    // Tarihe göre rezervasyonları filtrele
    const dateStr = format(date, 'yyyy-MM-dd');
    const todaysReservations = reservations.filter(r => r.date === dateStr);

    // Konum istatistiklerini hesapla
    const stats = tables.reduce((acc, table) => {
      const location = table.location;
      if (!acc[location]) {
        acc[location] = {
          name: location,
          reservationCount: 0,
          totalCapacity: tables
            .filter(t => t.location === location)
            .reduce((sum, t) => sum + t.capacity, 0),
          occupancyRate: 0,
          timeSlots: {}
        };
      }
      return acc;
    }, {} as Record<string, LocationStats>);

    // Rezervasyonları işle
    todaysReservations.forEach(reservation => {
      const table = tables.find(t => t.id === reservation.tableId);
      if (table) {
        const location = stats[table.location];
        location.reservationCount += reservation.persons; // Toplam kişi sayısını ekle

        // Saat formatını düzelt
        const [time] = reservation.time.split(' - ');
        const [hours] = time.split(':').map(Number);
        if (isNaN(hours)) return;

        const timeKey = `${hours.toString().padStart(2, '0')}:00`;

        if (!location.timeSlots[timeKey]) {
          location.timeSlots[timeKey] = {
            count: 0,
            reservations: []
          };
        }
        location.timeSlots[timeKey].count += reservation.persons; // Kişi sayısını ekle
        location.timeSlots[timeKey].reservations.push({
          ...reservation,
          table
        });
      }
    });

    // Doluluk oranlarını hesapla
    Object.values(stats).forEach(stat => {
      stat.occupancyRate = (stat.reservationCount / stat.totalCapacity) * 100;
    });

    return Object.values(stats);
  }, [reservations, tables, date]);

  if (view === Views.DAY) {
    return (
      <Card className="flex-1">
        <div className="h-[calc(100vh-180px)] p-6 flex flex-col">
          <CustomToolbar
            date={date}
            onNavigate={(action: string) => {
              const newDate = new Date(date);
              if (action === 'PREV') newDate.setDate(date.getDate() - 1);
              if (action === 'NEXT') newDate.setDate(date.getDate() + 1);
              if (action === 'TODAY') newDate.setTime(new Date().getTime());
              setDate(newDate);
            }}
            onView={setView}
            view={view}
          />
          <div className="flex-1 mt-2">
            <DailyView date={date} locationStats={locationStats} />
          </div>
        </div>
      </Card>
    );
  }

  if (view === Views.WEEK) {
    return (
      <Card className="flex-1">
        <div className="h-[calc(100vh-180px)] p-6 flex flex-col">
          <CustomToolbar
            date={date}
            onNavigate={(action: string) => {
              const newDate = new Date(date);
              if (action === 'PREV') newDate.setDate(date.getDate() - 7);
              if (action === 'NEXT') newDate.setDate(date.getDate() + 7);
              if (action === 'TODAY') newDate.setTime(new Date().getTime());
              setDate(newDate);
            }}
            onView={setView}
            view={view}
          />
          <div className="flex-1 mt-2">
            <WeeklyView 
              date={date} 
              locationStats={locationStats} 
              reservations={reservations}
              tables={tables}
            />
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex-1">
      <div className="h-[calc(100vh-180px)] p-6 flex flex-col">
        <CustomToolbar
          date={date}
          onNavigate={(action: string) => {
            const newDate = new Date(date);
            if (action === 'PREV') newDate.setMonth(date.getMonth() - 1);
            if (action === 'NEXT') newDate.setMonth(date.getMonth() + 1);
            if (action === 'TODAY') newDate.setTime(new Date().getTime());
            setDate(newDate);
          }}
          onView={setView}
          view={view}
        />
        <div className="flex-1 mt-2">
          <MonthlyView 
            date={date} 
            locationStats={locationStats}
            reservations={reservations}
            tables={tables}
          />
        </div>
      </div>
    </Card>
  );
}
