"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/components/ui/toast/use-toast";
import api from '@/lib/axios';
import { FormData, Table } from "./form/types";
import { DateTimeSection } from "./form/DateTimeSection";
import { CustomerInfoSection } from "./form/CustomerInfoSection";
import { TableLocationSection } from "./form/TableLocationSection";
import { ReservationDetailsSection } from "./form/ReservationDetailsSection";
import { NotesSection } from "./form/NotesSection";
import { cn } from "@/lib/utils";
import { Users, Calendar, MapPin, ClipboardList, MessageSquare } from "lucide-react";

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
  onUpdate?: () => void;
}

export function ReservationFormModal({ isOpen, onClose, initialData, onUpdate }: ReservationFormModalProps) {
  const [formData, setFormData] = useState<FormData>({
    customerName: "",
    phone: "",
    date: new Date(),
    time: format(new Date(), 'HH:mm'),
    persons: "2",
    tableId: "",
    type: "normal",
    location: "salon",
    serviceType: "standart",
    notes: "",
    specialRequests: "",
    status: "pending"
  });

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Veriler yükleniyor...");
  const [tableSections, setSections] = useState<Array<{section_id: number, section_name: string}>>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingMessage("Masalar yükleniyor...");
      
      try {
        const tablesResponse = await api.get('/api/postgres/list-tables');
        if (tablesResponse.data.success) {
          setTables(tablesResponse.data.data);
        }

        setLoadingMessage("Bölümler yükleniyor...");
        const sectionsResponse = await api.get('/api/postgres/list-sections');
        if (sectionsResponse.data.success) {
          setSections(sectionsResponse.data.data);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        toast({
          title: "Hata",
          description: "Veriler yüklenirken bir hata oluştu.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (isOpen && !initialData) {
      const now = new Date();
      now.setHours(now.getHours() + 1);
      
      setFormData({
        customerName: "",
        phone: "",
        date: now,
        time: format(now, 'HH:mm'),
        persons: "2",
        tableId: "",
        type: "normal",
        location: "salon",
        serviceType: "standart",
        notes: "",
        specialRequests: "",
        status: "pending"
      });
    }
  }, [isOpen, initialData]);

  useEffect(() => {
    if (initialData) {
      try {
        let dateObj = new Date();
        
        if (initialData.reservation_date) {
          dateObj = new Date(initialData.reservation_date);
        }

        const timeStr = initialData.reservation_time?.split(':').slice(0, 2).join(':') || '19:00';

        const newFormData = {
          customerName: initialData.customer_name || '',
          phone: initialData.customer_phone || '',
          date: dateObj,
          time: timeStr,
          persons: String(initialData.party_size) || '2',
          tableId: String(initialData.table_id) || '',
          type: 'normal' as const,
          location: (initialData.section_name?.toLowerCase() || 'salon') as const,
          serviceType: 'standart' as const,
          notes: initialData.notes || '',
          specialRequests: initialData.specialnotes || '',
          status: (initialData.status || 'pending') as const
        };

        setFormData(newFormData);
      } catch (error) {
        console.error('Error setting form data:', error);
        toast({
          title: "Hata",
          description: "Form verisi yüklenirken bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (tables.length > 0) {
      const filtered = tables.filter(table => 
        table.section_name.toLowerCase() === formData.location.toLowerCase()
      );
      setFilteredTables(filtered);

      if (formData.tableId && !filtered.find(t => String(t.table_id) === formData.tableId)) {
        setFormData(prev => ({ ...prev, tableId: "" }));
      }
    }
  }, [formData.location, tables]);

  const handleTableChange = (tableId: string) => {
    const selectedTable = tables.find(t => String(t.table_id) === tableId);
    if (selectedTable) {
      setFormData(prev => ({
        ...prev,
        tableId,
        location: selectedTable.section_name.toLowerCase() as any
      }));
    }
  };

  const handleChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formattedDate = format(formData.date, 'yyyy-MM-dd');

      const reservationData = {
        customer_name: formData.customerName,
        customer_phone: formData.phone,
        party_size: parseInt(formData.persons),
        reservation_date: formattedDate,
        reservation_time: formData.time,
        table_id: parseInt(formData.tableId),
        notes: formData.notes || '',
        specialnotes: formData.specialRequests || '',
        status: formData.status,
        branch_id: 1
      };

      let response;
      if (initialData?.id) {
        response = await api.put(`/api/postgres/update-reservation?reservationId=${initialData.id}`, reservationData);
      } else {
        response = await api.post('/api/postgres/add-reservation', reservationData);
      }

      if (response.data.success) {
        toast({
          title: initialData ? "Rezervasyon güncellendi" : "Rezervasyon oluşturuldu",
          description: "İşlem başarıyla tamamlandı.",
          variant: "success",
        });

        if (onUpdate) {
          onUpdate();
        }
        onClose();
      } else {
        throw new Error(response.data.message || 'Bir hata oluştu');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast({
        title: "Hata",
        description: error.message || "Rezervasyon kaydedilirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[85vw] h-[85vh] p-0 overflow-hidden bg-white dark:bg-gray-950">
        <div className="flex flex-col h-full">
          <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary via-primary/50 to-background">
            <DialogTitle className="text-2xl font-semibold text-white">
              {initialData ? "Rezervasyonu Düzenle" : "Yeni Rezervasyon"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-lg text-muted-foreground">{loadingMessage}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4">
                <div className="grid gap-4">
                  {/* Müşteri ve Tarih Bilgileri */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Users className="w-4 h-4" />
                        <h3 className="text-base font-medium">Müşteri Bilgileri</h3>
                      </div>
                      <div className="p-3 rounded-lg border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/50 dark:to-gray-900">
                        <CustomerInfoSection formData={formData} onFieldChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                        <Calendar className="w-4 h-4" />
                        <h3 className="text-base font-medium">Tarih ve Saat</h3>
                      </div>
                      <div className="p-3 rounded-lg border-2 border-purple-100 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/50 dark:to-gray-900">
                        <DateTimeSection formData={formData} onFieldChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  {/* Masa ve Rezervasyon Detayları */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <MapPin className="w-4 h-4" />
                        <h3 className="text-base font-medium">Masa ve Konum</h3>
                      </div>
                      <div className="p-3 rounded-lg border-2 border-amber-100 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/50 dark:to-gray-900">
                        <TableLocationSection
                          formData={formData}
                          sections={tableSections}
                          filteredTables={filteredTables}
                          onTableChange={handleTableChange}
                          onFieldChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                        <ClipboardList className="w-4 h-4" />
                        <h3 className="text-base font-medium">Rezervasyon Detayları</h3>
                      </div>
                      <div className="p-3 rounded-lg border-2 border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/50 dark:to-gray-900">
                        <ReservationDetailsSection formData={formData} onFieldChange={handleChange} />
                      </div>
                    </div>
                  </div>

                  {/* Notlar */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                      <MessageSquare className="w-4 h-4" />
                      <h3 className="text-base font-medium">Notlar ve Özel İstekler</h3>
                    </div>
                    <div className="p-3 rounded-lg border-2 border-rose-100 dark:border-rose-900 bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/50 dark:to-gray-900">
                      <NotesSection formData={formData} onFieldChange={handleChange} />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="p-6 border-t bg-gradient-to-r from-muted/30 via-muted/20 to-background">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="border-2"
              >
                İptal
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="min-w-[100px] bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {initialData?.id ? "Güncelleniyor..." : "Kaydediliyor..."}
                  </div>
                ) : (
                  initialData?.id ? "Güncelle" : "Kaydet"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
