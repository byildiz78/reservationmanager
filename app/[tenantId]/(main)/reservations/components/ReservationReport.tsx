"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useReservationStore } from "@/stores/reservation-store";
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths
} from "date-fns";
import { tr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Building2, Phone, Users, Clock, CalendarIcon, UtensilsCrossed, ChevronLeft, ChevronRight } from "lucide-react";
import { LocationType } from "@/types/reservation-types";
import { Button } from "@/components/ui/button";

interface DaySchedule {
  date: Date;
  reservations: any[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'cancelled':
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getLocationLabel = (location: LocationType) => {
  const labels = {
    salon: 'Salon',
    terrace: 'Teras',
    upstairs: 'Üst Kat'
  };
  return labels[location] || location;
};

const getStatusLabel = (status: string) => {
  const labels = {
    confirmed: 'Onaylandı',
    pending: 'Bekliyor',
    cancelled: 'İptal Edildi'
  };
  return labels[status as keyof typeof labels] || status;
};

export function ReservationReport() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const { reservations, tables } = useReservationStore();

  const navigateDate = (direction: 'prev' | 'next') => {
    switch (view) {
      case 'day':
        setSelectedDate(direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1));
        break;
      case 'week':
        setSelectedDate(direction === 'prev' ? subWeeks(selectedDate, 1) : addWeeks(selectedDate, 1));
        break;
      case 'month':
        setSelectedDate(direction === 'prev' ? subMonths(selectedDate, 1) : addMonths(selectedDate, 1));
        break;
    }
  };

  const getReservationsForDateRange = (start: Date, end: Date) => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return reservationDate >= start && reservationDate <= end;
    });
  };

  const getDaySchedule = (date: Date): DaySchedule => {
    const dayReservations = reservations.filter(
      reservation => reservation.date === format(date, "yyyy-MM-dd")
    );
    return {
      date,
      reservations: dayReservations,
    };
  };

  const getSchedule = () => {
    let start: Date;
    let end: Date;

    switch (view) {
      case "day":
        return [getDaySchedule(selectedDate)];
      case "week":
        start = startOfWeek(selectedDate, { locale: tr });
        end = endOfWeek(selectedDate, { locale: tr });
        break;
      case "month":
        start = startOfMonth(selectedDate);
        end = endOfMonth(selectedDate);
        break;
    }

    const days = eachDayOfInterval({ start, end });
    return days.map(day => getDaySchedule(day));
  };

  const schedule = getSchedule();

  const renderReservationCard = (reservation: any) => {
    const table = tables.find(t => t.id === reservation.tableId);

    return (
      <Card key={reservation.id} className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-semibold">{reservation.customerName}</span>
            <Badge variant="outline" className={getStatusColor(reservation.status)}>
              {getStatusLabel(reservation.status)}
            </Badge>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {reservation.time}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-4 h-4" />
              {reservation.phone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-4 h-4" />
              {reservation.persons} Kişi
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Building2 className="w-4 h-4" />
              Masa {table?.name} ({getLocationLabel(table?.location)})
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <UtensilsCrossed className="w-4 h-4" />
              {reservation.serviceType === 'alacarte' ? 'A La Carte' :
               reservation.serviceType === 'fixmenu' ? 'Fix Menü' :
               reservation.serviceType === 'standart' ? 'Standart' : 'Özel Menü'}
            </div>
          </div>
        </div>

        {(reservation.notes || reservation.specialRequests) && (
          <div className="text-sm space-y-1 border-t pt-2 mt-2">
            {reservation.notes && (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Not:</span> {reservation.notes}
              </div>
            )}
            {reservation.specialRequests && (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Özel İstek:</span> {reservation.specialRequests}
              </div>
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="border-b">
        <div className="max-w-[1200px] mx-auto w-full">
          <Tabs defaultValue={view} onValueChange={(v) => setView(v as "day" | "week" | "month")}>
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-4 flex-wrap">
                <TabsList className="h-9">
                  <TabsTrigger value="day" className="px-3">Gün</TabsTrigger>
                  <TabsTrigger value="week" className="px-3">Hafta</TabsTrigger>
                  <TabsTrigger value="month" className="px-3">Ay</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('prev')}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="sr-only">Önceki {view === 'day' ? 'Gün' : view === 'week' ? 'Hafta' : 'Ay'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate('next')}
                    className="h-9 w-9 p-0"
                  >
                    <ChevronRight className="h-4 w-4" />
                    <span className="sr-only">Sonraki {view === 'day' ? 'Gün' : view === 'week' ? 'Hafta' : 'Ay'}</span>
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedDate(new Date())}
                  className="h-9"
                >
                  Bugün
                </Button>
                <div className="text-sm font-medium min-w-[120px] text-right">
                  {format(selectedDate, "MMMM yyyy", { locale: tr })}
                </div>
              </div>
            </div>
          </Tabs>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-[calc(100vh-180px)]">
          <div className="max-w-[1200px] mx-auto w-full px-4">
            <div className="space-y-6">
              {schedule.map((day, index) => (
                <div key={index} className="space-y-4">
                  <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 py-2">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold">
                        {format(day.date, "d MMMM EEEE", { locale: tr })}
                      </h2>
                      <Badge variant="secondary">
                        {day.reservations.length} Rezervasyon
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {day.reservations.map(reservation => renderReservationCard(reservation))}
                    {day.reservations.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        Bu güne ait rezervasyon bulunmuyor
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      <div className="border-t">
        <div className="max-w-[1200px] mx-auto w-full px-4 py-4">
          <div className="flex justify-center">
            <div className="w-full max-w-[400px]">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                locale={tr}
                className="rounded-md border w-full bg-white"
                classNames={{
                  months: "w-full",
                  month: "w-full",
                  table: "w-full",
                  head_row: "w-full",
                  row: "w-full",
                  cell: "w-10 h-10 p-0",
                  day: "w-10 h-10 p-0 font-normal aria-selected:opacity-100",
                  day_today: "bg-primary text-primary-foreground font-bold hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                  day_outside: "text-muted-foreground opacity-50",
                  day_disabled: "text-muted-foreground opacity-50",
                  day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                  day_hidden: "invisible",
                  nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1",
                  caption: "pt-1 relative items-center justify-center",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
