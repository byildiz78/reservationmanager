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
      setFormData(reservation);
    }
  }, [reservation]);

  const handleChange = (field: keyof Reservation, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'yyyy-MM-dd');
    } catch (err) {
      console.error('Date formatting error:', err);
      return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      const response = await api.put('/api/postgres/update-reservation', {
        reservation_id: reservationId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        party_size: formData.party_size,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        status: formData.status,
        table_id: formData.table_id,
        notes: formData.notes
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
                  value={formData.customer_name}
                  onChange={(e) => handleChange('customer_name', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customerPhone">Telefon</Label>
                <Input
                  id="customerPhone"
                  value={formData.customer_phone}
                  onChange={(e) => handleChange('customer_phone', e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="customerEmail">E-posta</Label>
              <Input
                id="customerEmail"
                type="email"
                value={formData.customer_email || ''}
                onChange={(e) => handleChange('customer_email', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reservationDate">Tarih</Label>
                <Input
                  id="reservationDate"
                  type="date"
                  value={formatDate(formData.reservation_date)}
                  onChange={(e) => handleChange('reservation_date', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="reservationTime">Saat</Label>
                <Input
                  id="reservationTime"
                  type="time"
                  value={formData.reservation_time?.slice(0, 5) || ''}
                  onChange={(e) => handleChange('reservation_time', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="partySize">Kişi Sayısı</Label>
                <Input
                  id="partySize"
                  type="number"
                  value={formData.party_size}
                  onChange={(e) => handleChange('party_size', parseInt(e.target.value))}
                  min={1}
                  required
                />
              </div>
              <div>
                <Label htmlFor="table">Masa Seçimi</Label>
                <Select
                  value={formData.table_id?.toString()}
                  onValueChange={(value) => {
                    const selectedTable = tables.find(t => t.table_id.toString() === value);
                    handleChange('table_id', parseInt(value));
                    if (selectedTable) {
                      handleChange('table_name', selectedTable.table_name);
                      handleChange('table_capacity', selectedTable.table_capacity);
                      handleChange('table_status', selectedTable.table_status);
                      handleChange('section_name', selectedTable.section_name);
                      handleChange('section_description', selectedTable.section_description);
                      handleChange('is_smoking', selectedTable.is_smoking);
                      handleChange('is_outdoor', selectedTable.is_outdoor);
                      handleChange('is_vip', selectedTable.is_vip);
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
                              value={table.table_name.toString()}
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

            {formData.table_id && (
              <div>
                <Label>Masa ve Bölüm Bilgileri</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Masa:</span>
                    <span>{formData.table_name} ({formData.table_capacity} Kişilik)</span>
                    <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                      formData.table_status === 'available' ? 'bg-green-100 text-green-800' :
                      formData.table_status === 'occupied' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {formData.table_status === 'available' ? 'Müsait' :
                       formData.table_status === 'occupied' ? 'Dolu' : 'Rezerve'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Bölüm:</span>
                    <span>{formData.section_name}</span>
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

                  {formData.section_description && (
                    <div className="text-sm text-gray-600 mt-2">
                      {formData.section_description}
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
