"use client";

import { useState, useEffect } from "react";
import * as XLSX from 'xlsx';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronDown, FileSpreadsheet, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useReservationStore } from "@/stores/reservation-store";
import { Mail, Phone, Users, LayoutGrid, Table as TableIcon, StickyNote, Pencil, Trash2 } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface Reservation {
  id: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  reservationDate: string;
  reservationTime: string;
  guestCount: number;
  tableName: string;
  tableCapacity: number;
  sectionName: string;
  tableCategory: string;
  status: "confirmed" | "pending" | "cancelled" | "completed" | "customer_cancelled" | "customer_no_show" | "customer_arrived" | "payment_received" | "awaiting_payment";
  notes?: string;
  specialnotes?: string;
}

export function ReservationList() {
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(today);
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const { reservations, fetchReservations, isLoading } = useReservationStore();
  const itemsPerPage = 10;

  // Tarih aralığı değiştiğinde rezervasyonları yeniden getir
  useEffect(() => {
    const start = startDate ? format(startDate, 'yyyy-MM-dd') : undefined;
    const end = endDate ? format(endDate, 'yyyy-MM-dd') : undefined;
    fetchReservations(start, end);
  }, [startDate, endDate, statusFilter, sectionFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
      case "payment_received":
      case "customer_arrived":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
      case "awaiting_payment":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
      case "customer_cancelled":
      case "customer_no_show":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Onaylandı";
      case "pending":
        return "Beklemede";
      case "cancelled":
        return "İptal Edildi";
      case "completed":
        return "Tamamlandı";
      case "customer_cancelled":
        return "Müşteri İptal Etti";
      case "customer_no_show":
        return "Müşteri Gelmedi";
      case "customer_arrived":
        return "Müşteri Geldi";
      case "payment_received":
        return "Ödeme Alındı";
      case "awaiting_payment":
        return "Ödeme Bekleniyor";
      default:
        return status;
    }
  };

  const filteredReservations = reservations
    .filter(reservation => {
      let matchesFilters = true;

      // Tarih filtresi
      const reservationDate = new Date(reservation.reservationDate);
      
      if (startDate) {
        const startOfDay = new Date(startDate);
        startOfDay.setHours(0, 0, 0, 0);
        matchesFilters = matchesFilters && reservationDate >= startOfDay;
      }

      if (endDate) {
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        matchesFilters = matchesFilters && reservationDate <= endOfDay;
      }

      // Durum filtresi
      if (statusFilter) {
        matchesFilters = matchesFilters && reservation.status === statusFilter;
      }

      // Bölüm filtresi
      if (sectionFilter) {
        matchesFilters = matchesFilters && reservation.sectionName === sectionFilter;
      }

      // Arama filtresi
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        matchesFilters = matchesFilters && (
          reservation.customerName.toLowerCase().includes(searchLower) ||
          reservation.tableName.toLowerCase().includes(searchLower) ||
          reservation.sectionName.toLowerCase().includes(searchLower) ||
          reservation.notes?.toLowerCase().includes(searchLower) ||
          reservation.specialnotes?.toLowerCase().includes(searchLower)
        );
      }

      return matchesFilters;
    });

  const sections = Array.from(new Set(reservations.map(r => r.sectionName))).sort();
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleExportToExcel = () => {
    const dataToExport = filteredReservations.map(reservation => ({
      'Müşteri': reservation.customerName,
      'İletişim': `${reservation.customerEmail} ${reservation.customerPhone}`,
      'Tarih': format(new Date(reservation.reservationDate), "d MMMM yyyy", { locale: tr }),
      'Saat': reservation.reservationTime,
      'Kişi': reservation.guestCount,
      'Masa': `${reservation.tableName}`,
      'Bölüm': `${reservation.sectionName}`,
      'Durum': getStatusText(reservation.status),
      'Not': reservation.notes || '-',
      'Özel Not': reservation.specialnotes || '-'
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rezervasyonlar");

    const columnWidths = [
      { wch: 20 }, // Müşteri
      { wch: 25 }, // İletişim
      { wch: 15 }, // Tarih
      { wch: 8 },  // Saat
      { wch: 10 }, // Kişi
      { wch: 20 }, // Masa
      { wch: 20 }, // Bölüm
      { wch: 12 }, // Durum
      { wch: 30 }, // Not
      { wch: 30 }, // Özel Not
    ];
    ws['!cols'] = columnWidths;

    XLSX.writeFile(wb, `Rezervasyonlar_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const styles = `
      <style>
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 1rem;
        }
        th, td { 
          border: 1px solid #ddd; 
          padding: 8px; 
          text-align: left; 
        }
        th { 
          background-color: #f5f5f5; 
        }
        .status {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
        }
        .status-confirmed { background-color: #dcfce7; color: #166534; }
        .status-pending { background-color: #fef9c3; color: #854d0e; }
        .status-cancelled { background-color: #fee2e2; color: #991b1b; }
        .status-completed { background-color: #dbeafe; color: #1e40af; }
        @media print {
          body { font-size: 12px; }
          .no-print { display: none; }
        }
      </style>
    `;

    const getStatusClass = (status: string) => {
      switch (status) {
        case "confirmed": return "status-confirmed";
        case "pending": return "status-pending";
        case "cancelled": return "status-cancelled";
        case "completed": return "status-completed";
        default: return "";
      }
    };

    const tableHtml = `
      <html>
        <head>
          <title>Rezervasyon Listesi</title>
          ${styles}
        </head>
        <body>
          <h1>Rezervasyon Listesi</h1>
          <p>Oluşturma Tarihi: ${format(new Date(), "d MMMM yyyy HH:mm", { locale: tr })}</p>
          ${startDate && endDate ? `
            <p>Filtre: ${format(startDate, "d MMMM yyyy", { locale: tr })} - 
            ${format(endDate, "d MMMM yyyy", { locale: tr })}</p>
          ` : ''}
          <table>
            <thead>
              <tr>
                <th>Müşteri</th>
                <th>İletişim</th>
                <th>Tarih</th>
                <th>Saat</th>
                <th>Kişi</th>
                <th>Masa</th>
                <th>Bölüm</th>
                <th>Durum</th>
                <th>Not</th>
              </tr>
            </thead>
            <tbody>
              ${filteredReservations.map(reservation => `
                <tr>
                  <td>${reservation.customerName}</td>
                  <td>${reservation.customerEmail} ${reservation.customerPhone}</td>
                  <td>${format(new Date(reservation.reservationDate), "d MMMM yyyy", { locale: tr })}</td>
                  <td>${reservation.reservationTime}</td>
                  <td>${reservation.guestCount}</td>
                  <td>${reservation.tableName}</td>
                  <td>${reservation.sectionName}</td>
                  <td>
                    <span class="status ${getStatusClass(reservation.status)}">
                      ${getStatusText(reservation.status)}
                    </span>
                  </td>
                  <td>${reservation.notes || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(tableHtml);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "d MMMM yyyy", { locale: tr }) : "Başlangıç tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "d MMMM yyyy", { locale: tr }) : "Bitiş tarihi"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={(date) => date < startDate}
                />
              </PopoverContent>
            </Popover>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between">
                {statusFilter ? getStatusText(statusFilter) : "Tüm Durumlar"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                Tüm Durumlar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("confirmed")}>
                Onaylandı
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                Beklemede
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("cancelled")}>
                İptal Edildi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("completed")}>
                Tamamlandı
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("customer_cancelled")}>
                Müşteri İptal Etti
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("customer_no_show")}>
                Müşteri Gelmedi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("customer_arrived")}>
                Müşteri Geldi
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("payment_received")}>
                Ödeme Alındı
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("awaiting_payment")}>
                Ödeme Bekleniyor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-[180px] justify-between">
                {sectionFilter || "Tüm Bölümler"}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setSectionFilter(null)}>
                Tüm Bölümler
              </DropdownMenuItem>
              {sections.map((section) => (
                <DropdownMenuItem
                  key={section}
                  onClick={() => setSectionFilter(section)}
                >
                  {section}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Input
            placeholder="Ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-[200px]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleExportToExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Excel
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Müşteri</TableHead>
                    <TableHead className="w-[180px]">İletişim</TableHead>
                    <TableHead className="w-[140px]">Tarih</TableHead>
                    <TableHead className="w-[80px]">Saat</TableHead>
                    <TableHead className="w-[80px]">Kişi</TableHead>
                    <TableHead className="w-[120px]">Masa/Bölüm</TableHead>
                    <TableHead className="w-[100px]">Durum</TableHead>
                    <TableHead className="w-[200px]">Notlar</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReservations.map((reservation) => (
                    <TableRow key={reservation.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium">
                        {reservation.customerName}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          {reservation.customerEmail && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate">{reservation.customerEmail}</span>
                            </div>
                          )}
                          {reservation.customerPhone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{reservation.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {format(new Date(reservation.reservationDate), "d MMMM yyyy", { locale: tr })}
                      </TableCell>
                      <TableCell>{reservation.reservationTime}</TableCell>
                      <TableCell>{reservation.guestCount} Kişi</TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1.5">
                            <TableIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{reservation.tableName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <LayoutGrid className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{reservation.sectionName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn(
                          "whitespace-nowrap",
                          getStatusColor(reservation.status)
                        )}>
                          {getStatusText(reservation.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {reservation.notes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] truncate text-sm bg-muted/30 rounded px-2 py-1">
                                    {reservation.notes}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[300px]">
                                  <p className="font-medium mb-1">Not:</p>
                                  {reservation.notes}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {reservation.specialnotes && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="max-w-[200px] truncate text-sm bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded px-2 py-1">
                                    {reservation.specialnotes}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent side="left" className="max-w-[300px]">
                                  <p className="font-medium mb-1">Özel Not:</p>
                                  {reservation.specialnotes}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Toplam {filteredReservations.length} rezervasyon
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Önceki
              </Button>
              <div className="text-sm">
                Sayfa {page} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Sonraki
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
