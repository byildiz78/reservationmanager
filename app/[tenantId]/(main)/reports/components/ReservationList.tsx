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

interface Reservation {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  persons: number;
  tableName: string;
  tableCapacity: number;
  section: string;
  tableCategory: string;
  status: "confirmed" | "pending" | "cancelled" | "completed";
  notes?: string;
}

export function ReservationList() {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [sectionFilter, setSectionFilter] = useState<string | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const itemsPerPage = 10;

  // Rezervasyonları getir
  const fetchReservations = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      
      // Tarih filtresi
      if (startDate) {
        queryParams.append('date', format(startDate, 'yyyy-MM-dd'));
      }
      
      // Durum filtresi
      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }
      
      // Bölüm filtresi
      if (sectionFilter) {
        queryParams.append('section', sectionFilter);
      }

      const response = await fetch(`/api/postgres/list-reservations?${queryParams}`);
      const data = await response.json();
      
      if (data.success) {
        setReservations(data.data);
      } else {
        console.error('Rezervasyonlar alınamadı:', data.error);
      }
    } catch (error) {
      console.error('Rezervasyonlar alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtreler değiştiğinde rezervasyonları yeniden getir
  useEffect(() => {
    fetchReservations();
  }, [startDate, statusFilter, sectionFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "cancelled":
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
      default:
        return status;
    }
  };

  const filteredReservations = reservations
    .filter(reservation => {
      if (searchTerm) {
        return (
          reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.section.toLowerCase().includes(searchTerm.toLowerCase()) ||
          reservation.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      return true;
    });

  const sections = Array.from(new Set(reservations.map(r => r.section))).sort();
  const totalPages = Math.ceil(filteredReservations.length / itemsPerPage);
  const paginatedReservations = filteredReservations.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleExportToExcel = () => {
    // Tüm filtrelenmiş verileri al
    const dataToExport = filteredReservations.map(reservation => ({
      'Müşteri': reservation.customerName,
      'İletişim': `${reservation.email} ${reservation.phone}`,
      'Tarih': format(new Date(reservation.date), "d MMMM yyyy", { locale: tr }),
      'Saat': reservation.time,
      'Kişi': reservation.persons,
      'Masa': `${reservation.tableName} (${reservation.tableCapacity} kişilik)`,
      'Bölüm': `${reservation.section} (${reservation.tableCategory})`,
      'Durum': getStatusText(reservation.status),
      'Not': reservation.notes || '-'
    }));

    // Excel dosyası oluştur
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Rezervasyonlar");

    // Sütun genişliklerini ayarla
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
    ];
    ws['!cols'] = columnWidths;

    // Dosyayı indir
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
                  <td>${reservation.email} ${reservation.phone}</td>
                  <td>${format(new Date(reservation.date), "d MMMM yyyy", { locale: tr })}</td>
                  <td>${reservation.time}</td>
                  <td>${reservation.persons}</td>
                  <td>${reservation.tableName} (${reservation.tableCapacity} kişilik)</td>
                  <td>${reservation.section} (${reservation.tableCategory})</td>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "justify-start text-left font-normal w-[240px]",
                  !startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "d MMMM yyyy", { locale: tr }) : "Tarih seçin"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

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
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Yazdır
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Müşteri</TableHead>
                  <TableHead>İletişim</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Saat</TableHead>
                  <TableHead>Kişi</TableHead>
                  <TableHead>Masa</TableHead>
                  <TableHead>Bölüm</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Not</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReservations.map((reservation) => (
                  <TableRow key={reservation.id}>
                    <TableCell className="font-medium">
                      {reservation.customerName}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reservation.email}</div>
                        <div>{reservation.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>{format(new Date(reservation.date), "d MMMM yyyy", { locale: tr })}</TableCell>
                    <TableCell>{reservation.time}</TableCell>
                    <TableCell>{reservation.persons}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reservation.tableName}</div>
                        <div className="text-muted-foreground">({reservation.tableCapacity} kişilik)</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{reservation.section}</div>
                        <div className="text-muted-foreground">{reservation.tableCategory}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(getStatusColor(reservation.status))}>
                        {getStatusText(reservation.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {reservation.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
