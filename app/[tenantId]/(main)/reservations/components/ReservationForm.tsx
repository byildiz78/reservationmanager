"use client";

import { useEffect, useState, useMemo, useCallback } from 'react';
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
import { Dialog as BaseDialog } from "@radix-ui/react-dialog";

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

interface ReservationData {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  notes: string;
  specialnotes: string;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean | null;
  table: {
    table_id: number;
    table_name: string;
    table_capacity: number;
    table_status: string;
  };
  section: {
    id: number;
    name: string;
    description: string;
  };
}

export function ReservationForm({ reservationId, onClose }: ReservationFormProps) {
  const { reservation, tables, loading, error, refetch } = useReservation(reservationId);
  const [formData, setFormData] = useState<ReservationData>({
    id: 0,
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    party_size: 2,
    reservation_date: '',
    reservation_time: '',
    status: 'pending',
    notes: '',
    specialnotes: '',
    is_smoking: false,
    is_outdoor: false,
    is_vip: false,
    table: {
      table_id: 0,
      table_name: '',
      table_capacity: 0,
      table_status: 'available'
    },
    section: {
      id: 0,
      name: '',
      description: ''
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (reservation) {
      console.log('Setting up form with reservation:', JSON.stringify(reservation, null, 2));
      
      try {
        const initialFormData: ReservationData = {
          id: reservation.id,
          customer_name: reservation.customer_name || '',
          customer_phone: reservation.customer_phone || '',
          customer_email: reservation.customer_email || '',
          party_size: reservation.party_size || 2,
          reservation_date: reservation.reservation_date || '',
          reservation_time: reservation.reservation_time ? reservation.reservation_time.slice(0, 5) : '',
          status: reservation.status || 'pending',
          notes: reservation.notes || '',
          specialnotes: reservation.specialnotes || '',
          is_smoking: Boolean(reservation.is_smoking),
          is_outdoor: Boolean(reservation.is_outdoor),
          is_vip: reservation.is_vip === null ? false : Boolean(reservation.is_vip),
          table: {
            table_id: Number(reservation.table?.table_id || 0),
            table_name: reservation.table?.table_name || '',
            table_capacity: Number(reservation.table?.table_capacity || 0),
            table_status: reservation.table?.table_status || 'available'
          },
          section: {
            id: Number(reservation.section?.id || 0),
            name: reservation.section?.name || '',
            description: reservation.section?.description || ''
          }
        };

        console.log('Initial form data:', initialFormData);
        setFormData(initialFormData);
      } catch (error) {
        console.error('Error setting form data:', error);
        toast({
          title: "Hata",
          description: "Rezervasyon verileri yüklenirken bir hata oluştu.",
          variant: "destructive"
        });
      }
    }
  }, [reservation]);

  // Memoize the tables and sections lists
  const sortedTables = useMemo(() => {
    if (!tables) return [];
    return tables
      .filter(t => !formData.section.name || t.section_name === formData.section.name)
      .sort((a, b) => a.table_name.localeCompare(b.table_name));
  }, [tables, formData.section.name]);

  const uniqueSections = useMemo(() => {
    if (!tables) return [];
    return Array.from(new Set(tables.map(t => t.section_name))).sort();
  }, [tables]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);

      const submitData = {
        reservation_id: reservationId,
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_email: formData.customer_email,
        party_size: formData.party_size,
        reservation_date: formData.reservation_date,
        reservation_time: formData.reservation_time,
        status: formData.status,
        notes: formData.notes,
        specialnotes: formData.specialnotes,
        is_smoking: formData.is_smoking,
        is_outdoor: formData.is_outdoor,
        is_vip: formData.is_vip,
        table_id: formData.table.table_id,
        table_name: formData.table.table_name,
        table_capacity: formData.table.table_capacity,
        table_status: formData.table.table_status,
        section_name: formData.section.name,
        section_description: formData.section.description
      };

      console.log('Submitting data:', submitData);
      const response = await api.put('/api/postgres/update-reservation', submitData);

      if (response.data.success) {
        toast({
          title: "Başarılı",
          description: "Rezervasyon başarıyla güncellendi.",
        });
        onClose();
      } else {
        throw new Error(response.data.message || 'Güncelleme başarısız oldu');
      }
    } catch (error) {
      console.error('Error updating reservation:', error);
      toast({
        title: "Hata",
        description: "Rezervasyon güncellenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, reservationId, onClose]);

  const handleFieldChange = useCallback((field: keyof ReservationData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  if (loading) {
    return (
      <BaseDialog open={true} onOpenChange={() => onClose()}>
        <DialogContent 
          className="fixed inset-0 z-50 flex items-center justify-center focus-visible:outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="relative bg-white dark:bg-gray-800 w-[800px] max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2">Yükleniyor...</p>
            </div>
          </div>
        </DialogContent>
      </BaseDialog>
    );
  }

  if (error) {
    return (
      <BaseDialog open={true} onOpenChange={() => onClose()}>
        <DialogContent 
          className="fixed inset-0 z-50 flex items-center justify-center focus-visible:outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="relative bg-white dark:bg-gray-800 w-[800px] max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="p-6 text-center">
              <p className="text-red-500">Hata: {error}</p>
              <Button onClick={onClose} className="mt-4">Kapat</Button>
            </div>
          </div>
        </DialogContent>
      </BaseDialog>
    );
  }

  if (!reservation) {
    return (
      <BaseDialog open={true} onOpenChange={() => onClose()}>
        <DialogContent 
          className="fixed inset-0 z-50 flex items-center justify-center focus-visible:outline-none"
          onOpenAutoFocus={(e) => e.preventDefault()}
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <div className="relative bg-white dark:bg-gray-800 w-[800px] max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
            <div className="p-6 text-center">
              <p>Rezervasyon bulunamadı</p>
            </div>
          </div>
        </DialogContent>
      </BaseDialog>
    );
  }

  return (
    <BaseDialog open={true} onOpenChange={() => onClose()}>
      <DialogContent 
        className="fixed inset-0 z-50 flex items-center justify-center focus-visible:outline-none"
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="relative bg-white dark:bg-gray-800 w-[800px] max-h-[90vh] rounded-lg shadow-lg flex flex-col overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>Rezervasyon Düzenle</DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 flex-1 overflow-y-auto">
            <form id="reservation-form" onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Müşteri Adı</Label>
                  <Input
                    id="customerName"
                    value={formData.customer_name}
                    onChange={(e) => handleFieldChange('customer_name', e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Telefon</Label>
                  <Input
                    id="customerPhone"
                    value={formData.customer_phone}
                    onChange={(e) => handleFieldChange('customer_phone', e.target.value)}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="customerEmail">E-posta</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customer_email || ''}
                  onChange={(e) => handleFieldChange('customer_email', e.target.value)}
                  autoComplete="off"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reservationDate">Tarih</Label>
                  <Input
                    id="reservationDate"
                    type="date"
                    value={formData.reservation_date}
                    onChange={(e) => handleFieldChange('reservation_date', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reservationTime">Saat</Label>
                  <Input
                    id="reservationTime"
                    type="time"
                    value={formData.reservation_time || ''}
                    onChange={(e) => handleFieldChange('reservation_time', e.target.value)}
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
                    value={formData.party_size}
                    onChange={(e) => handleFieldChange('party_size', parseInt(e.target.value))}
                    min={1}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="section">Bölüm</Label>
                  <Select
                    value={formData.section.name}
                    onValueChange={(sectionName) => {
                      setFormData(prev => ({
                        ...prev,
                        section: {
                          name: sectionName,
                          id: 0,
                          description: ''
                        },
                        table: {
                          table_id: 0,
                          table_name: '',
                          table_capacity: 0,
                          table_status: 'available'
                        }
                      }));
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Bölüm seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {uniqueSections.map(sectionName => (
                        <SelectItem key={sectionName} value={sectionName}>
                          {sectionName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table">Masa</Label>
                  <Select
                    value={formData.table.table_name}
                    onValueChange={(tableName) => {
                      const selectedTable = tables.find(t => t.table_name === tableName);
                      if (selectedTable) {
                        setFormData(prev => ({
                          ...prev,
                          table: {
                            table_id: selectedTable.table_id,
                            table_name: selectedTable.table_name,
                            table_capacity: selectedTable.table_capacity,
                            table_status: selectedTable.table_status
                          }
                        }));
                      }
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Masa seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {sortedTables.map((table) => (
                        <SelectItem 
                          key={table.table_id} 
                          value={table.table_name}
                        >
                          Masa {table.table_name} ({table.table_capacity} Kişilik)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="status">Durum</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleFieldChange('status', value)}
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
                  onChange={(e) => handleFieldChange('notes', e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {formData.table.table_id && (
                <div>
                  <Label>Masa ve Bölüm Bilgileri</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-md space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Masa:</span>
                      <span>{formData.table.table_name} ({formData.table.table_capacity} Kişilik)</span>
                      <span className={`ml-2 text-sm px-2 py-0.5 rounded ${
                        formData.table.table_status === 'available' ? 'bg-green-100 text-green-800' :
                        formData.table.table_status === 'occupied' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {formData.table.table_status === 'available' ? 'Müsait' :
                         formData.table.table_status === 'occupied' ? 'Dolu' : 'Rezerve'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Bölüm:</span>
                      <span>{formData.section.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Özellikler:</span>
                      <div className="flex gap-2">
                        {formData.is_smoking && (
                          <span className="text-sm bg-red-100 text-red-800 px-2 py-0.5 rounded">
                            Sigara İçilebilir
                          </span>
                        )}
                        {formData.is_outdoor && (
                          <span className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded">
                            Açık Alan
                          </span>
                        )}
                        {formData.is_vip && (
                          <span className="text-sm bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                            VIP
                          </span>
                        )}
                      </div>
                    </div>

                    {formData.section.description && (
                      <div className="text-sm text-gray-600 mt-2">
                        {formData.section.description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </form>
          </div>

          <DialogFooter className="px-6 py-4 border-t bg-gray-50">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              type="button"
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
          </DialogFooter>
        </div>
      </DialogContent>
    </BaseDialog>
  );
}
