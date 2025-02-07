"use client";

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReservation } from '../hooks/useReservation';
import { Reservation } from './ReservationCard';
import { format } from 'date-fns';
import { toast } from "@/components/ui/toast/use-toast";
import api from '@/lib/axios';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReservationFormProps {
  reservationId: number;
  onClose: () => void;
}

interface Table {
  table_id: number;
  table_name: string;
  table_capacity: number;
  table_status: string;
  section_name: string;
  section_description: string;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean;
}

export function ReservationForm({ reservationId, onClose }: ReservationFormProps) {
  const { reservation, tables, loading, error, refetch } = useReservation(reservationId);
  const [formData, setFormData] = useState<Partial<Reservation>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reservation) {
      console.log('Raw reservation data:', reservation);
      
      try {
        // Convert snake_case to camelCase for form data
        const formattedData = {
          id: reservation.id,
          customerName: reservation.customer_name || '',
          customerPhone: reservation.customer_phone || '',
          customerEmail: reservation.customer_email || '',
          guestCount: reservation.party_size || 2,
          reservationDate: formatDate(reservation.reservation_date),
          reservationTime: reservation.reservation_time ? reservation.reservation_time.slice(0, 5) : '',
          tableId: reservation.table_id,
          tableName: reservation.table_name || '',
          tableCapacity: reservation.table_capacity,
          tableStatus: reservation.table_status,
          sectionName: reservation.section_name || '',
          sectionDescription: reservation.section_description || '',
          status: reservation.status || 'pending',
          notes: reservation.notes || '',
          specialnotes: reservation.specialnotes || '',
          is_smoking: reservation.is_smoking || false,
          is_outdoor: reservation.is_outdoor || false,
          is_vip: reservation.is_vip || false
        };

        console.log('Formatted form data:', formattedData);
        setFormData(formattedData);
      } catch (error) {
        console.error('Error setting form data:', error, 'Raw data:', reservation);
        toast({
          title: "Hata",
          description: "Rezervasyon verileri yüklenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    }
  }, [reservation]);

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) {
      console.log('No date string provided');
      return '';
    }
    try {
      console.log('Formatting date:', dateString);
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.error('Invalid date:', dateString);
        return '';
      }
      const formatted = format(date, 'yyyy-MM-dd');
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (err) {
      console.error('Date formatting error:', err);
      return '';
    }
  };

  const handleChange = (field: keyof Reservation, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      // Convert camelCase back to snake_case for API
      const response = await api.put('/api/postgres/update-reservation', {
        reservation_id: reservationId,
        customer_name: formData.customerName,
        customer_phone: formData.customerPhone,
        customer_email: formData.customerEmail,
        party_size: formData.guestCount,
        reservation_date: formData.reservationDate,
        reservation_time: formData.reservationTime,
        status: formData.status,
        table_id: formData.tableId,
        notes: formData.notes,
        specialnotes: formData.specialnotes
      });

      if (response.data.success) {
        toast({
          title: "Başarılı!",
          description: "Rezervasyon başarıyla güncellendi.",
        });
        await refetch();
        onClose();
      } else {
        throw new Error(response.data.error || 'Güncelleme başarısız oldu');
      }
    } catch (err) {
      console.error('Error updating reservation:', err);
      toast({
        title: "Hata!",
        description: err instanceof Error ? err.message : 'Rezervasyon güncellenirken bir hata oluştu',
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p className="text-red-500">Hata: {error}</p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <p>Rezervasyon bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Rezervasyon Düzenle</h2>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          <form id="reservation-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Müşteri Adı</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleChange('customerName', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Telefon</Label>
                <Input
                  id="customerPhone"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail">E-posta</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customerEmail || ''}
                onChange={(e) => handleChange('customerEmail', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reservationDate">Tarih</Label>
                <Input
                  id="reservationDate"
                  type="date"
                  value={formatDate(formData.reservationDate)}
                  onChange={(e) => handleChange('reservationDate', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reservationTime">Saat</Label>
                <Input
                  id="reservationTime"
                  type="time"
                  value={formData.reservationTime?.slice(0, 5) || ''}
                  onChange={(e) => handleChange('reservationTime', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="guestCount">Kişi Sayısı</Label>
                <Input
                  id="guestCount"
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => handleChange('guestCount', parseInt(e.target.value))}
                  min={1}
                  required
                />
              </div>
              <div>
                <Label htmlFor="table">Masa Seçimi</Label>
                <Select
                  value={formData.tableName}
                  onValueChange={(tableName) => {
                    const selectedTable = tables.find(t => t.table_name === tableName);
                    if (selectedTable) {
                      setFormData(prev => ({
                        ...prev,
                        tableId: selectedTable.table_id,
                        tableName: selectedTable.table_name
                      }));
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Masa seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Bölümlere göre grupla */}
                    {Array.from(new Set(tables.map(t => t.section_name))).sort().map(sectionName => (
                      <div key={sectionName}>
                        <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground bg-muted/50">
                          {sectionName}
                        </div>
                        {tables
                          .filter(t => t.section_name === sectionName)
                          .sort((a, b) => a.table_name.localeCompare(b.table_name))
                          .map((table) => (
                            <SelectItem 
                              key={table.table_id} 
                              value={table.table_name}
                              className="pl-4"
                            >
                              Masa {table.table_name} ({table.table_capacity} Kişilik)
                            </SelectItem>
                          ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="status">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="confirmed">Onaylandı</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notlar</Label>
              <Textarea
                id="notes"
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {formData.tableId && (
              <div>
                <Label>Masa ve Bölüm Bilgileri</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Masa:</span>
                    <span>{formData.tableName} ({formData.tableCapacity} Kişilik)</span>
                    <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                      formData.tableStatus === 'available' ? 'bg-green-100 text-green-800' :
                      formData.tableStatus === 'occupied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formData.tableStatus === 'available' ? 'Müsait' :
                       formData.tableStatus === 'occupied' ? 'Dolu' : 'Rezerve'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Bölüm:</span>
                    <span>{formData.sectionName}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Özellikler:</span>
                    <div className="flex gap-2">
                      {formData.is_smoking && (
                        <span className="text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                          🚬 Sigara İçilebilir
                        </span>
                      )}
                      {formData.is_outdoor && (
                        <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                          🌳 Açık Alan
                        </span>
                      )}
                      {formData.is_vip && (
                        <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                          ⭐ VIP
                        </span>
                      )}
                    </div>
                  </div>

                  {formData.sectionDescription && (
                    <div className="text-sm text-gray-600 mt-2">
                      {formData.sectionDescription}
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            İptal
          </Button>
          <Button
            type="submit"
            form="reservation-form"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
          </Button>
        </div>
      </div>
    </div>
  );
}
