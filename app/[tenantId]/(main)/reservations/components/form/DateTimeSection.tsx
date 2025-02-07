"use client";

import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { FormData } from "./types";

interface DateTimeSectionProps {
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function DateTimeSection({ formData, onFieldChange }: DateTimeSectionProps) {
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
            <Label htmlFor="date">Tarih</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !formData.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateSafe(formData.date)}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={formData.date}
                  onSelect={(date) => onFieldChange("date", date)}
                  initialFocus
                  locale={tr}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="time">Saat</Label>
            <Select value={formData.time} onValueChange={(value) => onFieldChange("time", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 6 }, (_, i) => i + 18).map((hour) => (
                  <SelectItem key={hour} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
