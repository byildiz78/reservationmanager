"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FormData } from "./types";

interface DateTimeSectionProps {
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function DateTimeSection({ formData, onFieldChange }: DateTimeSectionProps) {
  // 11:00'dan 24:00'a kadar 30 dakikalık aralıklarla saat seçenekleri
  const timeSlots = [];
  for (let hour = 11; hour <= 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      if (hour === 24 && minute > 0) continue; // 24:00'dan sonrasını alma
      const formattedHour = hour.toString().padStart(2, '0');
      const formattedMinute = minute.toString().padStart(2, '0');
      timeSlots.push(`${formattedHour}:${formattedMinute}`);
    }
  }

  const formatDateSafe = (date: Date | null | undefined) => {
    if (!date || isNaN(date.getTime())) {
      return <span>Tarih seçin</span>;
    }
    try {
      return format(date, "PPP", { locale: tr });
    } catch (error) {
      console.error('Error formatting date:', error);
      return <span>Tarih seçin</span>;
    }
  };

  return (
    <div className="space-y-4 py-2 pb-4">
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="flex items-center gap-2 mb-2" htmlFor="date">
              <CalendarIcon className="w-4 h-4 text-primary" />
              Tarih
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-11 bg-muted/50"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.date ? (
                    format(formData.date, "d MMMM yyyy", { locale: tr })
                  ) : (
                    <span>Tarih seçin</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => onFieldChange("date", date || new Date())}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="flex items-center gap-2 mb-2" htmlFor="time">
              <Clock className="w-4 h-4 text-primary" />
              Saat
            </Label>
            <Select 
              value={formData.time} 
              onValueChange={(value) => onFieldChange("time", value)}
            >
              <SelectTrigger className="w-full h-11 bg-muted/50">
                <SelectValue placeholder="Saat seçin" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
