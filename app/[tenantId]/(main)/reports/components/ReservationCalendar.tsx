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
  reservations: any[];
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

const calculateLocationStats = (targetDate: Date, reservations: any[], tables: any[]) => {
  // Debug logs
  console.log('Calculating stats for date:', targetDate);
  console.log('All reservations:', reservations);
  console.log('All tables:', tables);

  // Tarihe göre rezervasyonları filtrele
  const dateStr = format(targetDate, 'yyyy-MM-dd');
  console.log('Looking for date:', dateStr);

  const todaysReservations = reservations.filter(r => {
    // Convert UTC date to local date for comparison
    const reservationDate = new Date(r.reservationDate);
    // Since reservationDate is already in UTC, we just need to format it in local time
    const reservationDateStr = format(reservationDate, 'yyyy-MM-dd');
    console.log('Comparing reservation date:', reservationDateStr, 'with target:', dateStr, 'reservation:', r.customerName);
    return reservationDateStr === dateStr;
  });

  console.log('Filtered reservations:', todaysReservations);

  // Konum istatistiklerini hesapla
  const stats = tables.reduce((acc, table) => {
    const location = table.section_id;
    if (!acc[location]) {
      acc[location] = {
        name: table.section_name || location,
        reservationCount: 0,
        totalCapacity: tables
          .filter(t => t.section_id === location)
          .reduce((sum, t) => sum + Number(t.table_capacity || 0), 0),
        occupancyRate: 0,
        timeSlots: {},
        reservations: [] // Rezervasyonlar dizisini ekle
      };
    }
    return acc;
  }, {} as Record<string, LocationStats>);

  // Rezervasyonları işle
  todaysReservations.forEach(reservation => {
    // Convert tableId to string for comparison
    const table = tables.find(t => Number(t.table_id) === reservation.tableId);
    console.log('Processing reservation:', reservation.customerName, 'tableId:', reservation.tableId, 'found table:', table);
    
    if (table) {
      const location = stats[table.section_id];
      if (location) {
        location.reservationCount += reservation.guestCount;
        location.reservations.push(reservation); // Rezervasyonu diziye ekle

        // Parse reservation time directly from reservationTime field
        const timeKey = reservation.reservationTime.substring(0, 2) + ':00';
        console.log('Adding reservation to time slot:', timeKey, 'customer:', reservation.customerName);

        if (!location.timeSlots[timeKey]) {
          location.timeSlots[timeKey] = {
            count: 0,
            reservations: []
          };
        }
        location.timeSlots[timeKey].count += reservation.guestCount;
        location.timeSlots[timeKey].reservations.push({
          ...reservation,
          table
        });
      }
    }
  });

  // Doluluk oranlarını hesapla
  Object.values(stats).forEach(stat => {
    stat.occupancyRate = stat.totalCapacity > 0 ? (stat.reservationCount / stat.totalCapacity) * 100 : 0;
  });

  console.log('Final stats:', stats);
  return Object.values(stats);
};

const DailyView = ({ date, locationStats }: { date: Date; locationStats: LocationStats[] }) => {
  const timeSlots = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 11; // 11:00'dan başla
    return `${hour}:00`;
  });

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden">
      <div className="grid grid-cols-[100px_1fr] border-b bg-muted/50">
        <div className="p-2 font-medium text-sm border-r">Saat</div>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${locationStats.length}, 1fr)` }}>
          {locationStats.map((location, i) => (
            <div 
              key={i}
              className="p-2 font-medium text-sm border-r last:border-r-0 text-center"
            >
              <div className="font-semibold">{location.name}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {location.reservationCount} / {location.totalCapacity}
              </div>
              <div className="text-xs text-muted-foreground">
                Toplam Kişi
              </div>
              <div className="mt-1">
                <OccupancyBar value={location.occupancyRate} />
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  %{Math.round(location.occupancyRate)} Doluluk
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="grid grid-cols-[100px_1fr]">
          {timeSlots.map((time, i) => (
            <div key={i} className="contents">
              <div className="p-2 text-sm border-b border-r bg-white sticky left-0">
                {time}
              </div>
              <div 
                className="grid border-b" 
                style={{ gridTemplateColumns: `repeat(${locationStats.length}, 1fr)` }}
              >
                {locationStats.map((location, j) => {
                  const timeSlot = location.timeSlots[time];
                  return (
                    <div 
                      key={j}
                      className={cn(
                        "relative p-2 text-xs border-r border-b last:border-r-0",
                        "hover:bg-muted/5"
                      )}
                    >
                      {timeSlot && (
                        <>
                          <div 
                            className={cn(
                              "absolute inset-0 opacity-15 transition-opacity",
                              getProgressColor(timeSlot.count / location.totalCapacity * 100)
                            )} 
                          />
                          <div className="relative">
                            <div className="font-medium text-center">
                              {timeSlot.reservations.length} Rez. ({timeSlot.count} Kişi)
                            </div>
                          </div>
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

  const weeklyStats = weekDays.map(day => ({
    date: day.date,
    stats: calculateLocationStats(day.date, reservations, tables)
  }));

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
                {weeklyStats.map(({ date: dayDate, stats }, j) => {
                  const dayStat = stats.find(s => s.name === location.name) || {
                    ...location,
                    reservationCount: 0,
                    occupancyRate: 0
                  };
                  
                  return (
                    <div 
                      key={j}
                      className={cn(
                        "relative p-2 text-xs border-r border-b last:border-r-0",
                        "hover:bg-muted/5"
                      )}
                    >
                      {dayStat.reservationCount > 0 && (
                        <>
                          <div 
                            className={cn(
                              "absolute inset-0 opacity-15 transition-opacity",
                              getProgressColor(dayStat.occupancyRate)
                            )} 
                          />
                          <div className="relative flex items-center justify-center gap-2">
                            <div className="text-[10px] font-medium text-center">
                              {dayStat.reservations?.length || 0} Rez. ({dayStat.reservationCount} Kişi)
                            </div>
                          </div>
                          <OccupancyBar value={dayStat.occupancyRate} />
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

  const monthlyStats = weeks.flat().map(day => ({
    date: day.date,
    isCurrentMonth: day.isCurrentMonth,
    stats: calculateLocationStats(day.date, reservations, tables)
  }));

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
          {monthlyStats.map(({ date: dayDate, stats, isCurrentMonth }, i) => {
            const totalOccupancy = stats.reduce((acc, stat) => acc + stat.occupancyRate, 0) / stats.length;

            return (
              <div 
                key={i}
                className={cn(
                  "min-h-[120px] p-2 text-xs border-r border-b last:border-r-0",
                  "hover:bg-muted/5",
                  !isCurrentMonth && "opacity-50"
                )}
              >
                <div className="font-medium mb-2">
                  {format(dayDate, 'd', { locale: tr })}
                </div>
                {stats.some(stat => stat.reservationCount > 0) && (
                  <div className="space-y-1 max-h-[100px] overflow-y-auto custom-scrollbar">
                    {stats.map((stat, j) => (
                      <div 
                        key={j} 
                        className={cn(
                          "p-1 rounded",
                          stat.reservationCount > 0 && "bg-muted/30"
                        )}
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-medium truncate flex-1">{stat.name}</span>
                          <div className="text-[10px] font-medium text-center whitespace-nowrap">
                            {stat.reservations?.length || 0} Rez. ({stat.reservationCount} Kişi)
                          </div>
                        </div>
                        {stat.reservationCount > 0 && (
                          <OccupancyBar value={stat.occupancyRate} className="mt-1" />
                        )}
                      </div>
                    ))}
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

<style jsx global>{`
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
`}</style>

export function ReservationCalendar() {
  const [view, setView] = useState(Views.DAY);
  const [date, setDate] = useState(new Date());
  const { reservations, tables } = useReservationStore();

  const locationStats = useMemo(() => calculateLocationStats(date, reservations, tables), [date, reservations, tables]);

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
