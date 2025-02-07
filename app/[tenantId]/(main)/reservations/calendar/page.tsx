"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReservationCalendar } from "../../reports/components/ReservationCalendar";

export default function ReservationCalendarPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Rezervasyon Takvimi</h2>
      </div>

      <Tabs defaultValue="calendar" className="space-y-4">
        <TabsList>
          <TabsTrigger value="calendar">Takvim Görünümü</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar" className="space-y-4">
          <div className="bg-card rounded-lg border shadow-sm">
            <ReservationCalendar />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}