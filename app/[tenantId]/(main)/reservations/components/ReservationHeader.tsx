"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, Search } from "lucide-react";
import { Section } from "@/stores/reservation-store";

interface ReservationHeaderProps {
  totalCount: number;
  pendingCount: number;
  sections: Section[];
  selectedSection: number | 'all';
  onSectionChange: (value: number | 'all') => void;
  selectedStatus: string;
  onStatusChange: (value: string) => void;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onNewReservation: () => void;
}

export function ReservationHeader({
  totalCount,
  pendingCount,
  sections,
  selectedSection,
  onSectionChange,
  selectedStatus,
  onStatusChange,
  searchQuery,
  onSearchChange,
  onNewReservation
}: ReservationHeaderProps) {
  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="İsim, telefon veya masa numarası ile ara..."
            className="h-8 w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">
              Toplam: <span className="font-medium text-foreground">{totalCount}</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Bekleyen: <span className="font-medium text-amber-600 dark:text-amber-400">{pendingCount}</span>
            </div>
          </div>

          <Select
            value={selectedSection.toString()}
            onValueChange={(value) => onSectionChange(value === 'all' ? 'all' : Number(value))}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Bölüm seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Bölümler</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.section_id} value={section.section_id.toString()}>
                  {section.section_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedStatus}
            onValueChange={onStatusChange}
          >
            <SelectTrigger className="h-8 w-[180px]">
              <SelectValue placeholder="Durum seçin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="confirmed">Onaylandı</SelectItem>
              <SelectItem value="pending">Bekliyor</SelectItem>
              <SelectItem value="cancelled">İptal</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="default"
            size="sm"
            className="h-8"
            onClick={onNewReservation}
          >
            <CalendarPlus className="h-4 w-4 mr-2" />
            Yeni Rezervasyon
          </Button>
        </div>
      </div>
    </div>
  );
}
