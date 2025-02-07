"use client";

import { useEffect, useState } from "react";
import { format, addDays } from "date-fns";
import { tr } from "date-fns/locale";
import { useReservationStore } from "@/stores/reservation-store";
import api from "@/lib/axios";
import { 
  Loader2, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Filter
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  table_name: string;
  table_capacity: number;
  section_name: string;
  status: string;
  notes: string;
  specialnotes: string;
  is_smoking: boolean;
  is_outdoor: boolean;
}

interface PaginationData {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

const PAGE_SIZES = [10, 20, 50, 100];

export function ReservationReport() {
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({ total: 0, page: 1, pageSize: 10, totalPages: 0 });
  const [search, setSearch] = useState("");
  const { selectedDate } = useReservationStore();
  const [endDate, setEndDate] = useState<Date>(addDays(selectedDate, 7));

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/postgres/reservation-report', {
        params: {
          startDate: format(selectedDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          page: pagination.page,
          pageSize: pagination.pageSize,
          search: search || undefined
        }
      });
      
      if (response.data.success) {
        setReservations(response.data.data.reservations);
        setPagination(response.data.data.pagination);
      } else {
        console.error('Error in response:', response.data.error);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData();
  }, [selectedDate, endDate, pagination.page, pagination.pageSize, search]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success">Tamamlandı</Badge>;
      case 'canceled':
        return <Badge variant="destructive">İptal</Badge>;
      default:
        return <Badge variant="secondary">Bekliyor</Badge>;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Başlangıç Tarihi</label>
            <Input
              type="date"
              value={format(selectedDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = new Date(e.target.value);
                useReservationStore.setState({ selectedDate: date });
              }}
              className="w-full"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium">Bitiş Tarihi</label>
            <Input
              type="date"
              value={format(endDate, 'yyyy-MM-dd')}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setEndDate(date);
              }}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Ara..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
          <div className="flex-none">
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => setPagination(prev => ({ ...prev, page: 1, pageSize: parseInt(value) }))}
            >
              <SelectTrigger className="w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} Adet
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Müşteri</TableHead>
              <TableHead>Telefon</TableHead>
              <TableHead className="text-center">Kişi</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Saat</TableHead>
              <TableHead>Masa</TableHead>
              <TableHead>Bölüm</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead>Notlar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pagination.pageSize }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 9 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : reservations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Rezervasyon bulunamadı
                </TableCell>
              </TableRow>
            ) : (
              reservations.map((reservation) => (
                <TableRow key={reservation.id}>
                  <TableCell className="font-medium">{reservation.customer_name}</TableCell>
                  <TableCell>{reservation.customer_phone}</TableCell>
                  <TableCell className="text-center">{reservation.party_size}</TableCell>
                  <TableCell>{format(new Date(reservation.reservation_date), 'd MMM yyyy', { locale: tr })}</TableCell>
                  <TableCell>{reservation.reservation_time}</TableCell>
                  <TableCell>{reservation.table_name}</TableCell>
                  <TableCell>{reservation.section_name}</TableCell>
                  <TableCell>{getStatusBadge(reservation.status)}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={reservation.specialnotes || reservation.notes}>
                    {reservation.specialnotes || reservation.notes}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Toplam {pagination.total} rezervasyon
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page === 1 || loading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Sayfa {pagination.page} / {pagination.totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page === pagination.totalPages || loading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
