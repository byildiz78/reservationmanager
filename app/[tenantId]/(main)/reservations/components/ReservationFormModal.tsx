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
import { FormData, Table, Section } from "./form/types";
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
    sectionId: "",
    type: "normal",
    serviceType: "standart",
    notes: "",
    specialRequests: "",
    status: "pending"
  });

  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Veriler yükleniyor...");
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setLoadingMessage("Masalar ve bölümler yükleniyor...");
      
      try {
        const [tablesResponse, sectionsResponse] = await Promise.all([
          api.get('/api/postgres/list-tables'),
          api.get('/api/postgres/list-sections')
        ]);

        if (tablesResponse.data.success) {
          setTables(tablesResponse.data.data);
          setFilteredTables(tablesResponse.data.data);
        }

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
        sectionId: "",
        type: "normal",
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
          sectionId: String(initialData.section_id) || '',
          type: 'normal' as const,
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
    if (formData.sectionId) {
      const sectionTables = tables.filter(
        table => table.section_id === parseInt(formData.sectionId)
      );
      setFilteredTables(sectionTables);
    } else {
      setFilteredTables(tables);
    }
  }, [formData.sectionId, tables]);

  const handleFieldChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
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
        section_id: parseInt(formData.sectionId),
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
      <DialogContent className="max-w-[90vw] h-[90vh] p-0 overflow-hidden bg-gradient-to-br from-background via-background to-muted/10 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900/50">
        <div className="flex flex-col h-full">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary/90 to-primary/50">
            <DialogTitle className="text-xl font-semibold text-white flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20">
                {initialData ? 
                  <ClipboardList className="w-5 h-5 text-white" /> : 
                  <Calendar className="w-5 h-5 text-white" />
                }
              </div>
              {initialData ? "Rezervasyonu Düzenle" : "Yeni Rezervasyon"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-base text-muted-foreground animate-pulse">{loadingMessage}</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Üst Bölüm: Müşteri ve Tarih Bilgileri */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Müşteri Bilgileri */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/50">
                        <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Müşteri Bilgileri
                      </h3>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-blue-100/50 dark:border-blue-900/50 
                      bg-white dark:bg-gray-900 shadow-sm">
                      <CustomerInfoSection formData={formData} onFieldChange={handleFieldChange} />
                    </div>
                  </div>

                  {/* Tarih ve Saat */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <div className="p-1.5 rounded-md bg-purple-100 dark:bg-purple-900/50">
                        <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-sm font-medium text-purple-600 dark:text-purple-400">
                        Tarih ve Saat
                      </h3>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-purple-100/50 dark:border-purple-900/50 
                      bg-white dark:bg-gray-900 shadow-sm">
                      <DateTimeSection formData={formData} onFieldChange={handleFieldChange} />
                    </div>
                  </div>
                </div>

                {/* Orta Bölüm: Masa ve Rezervasyon Detayları */}
                <div className="grid lg:grid-cols-2 gap-4">
                  {/* Masa ve Konum */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <div className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/50">
                        <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <h3 className="text-sm font-medium text-amber-600 dark:text-amber-400">
                        Masa ve Konum
                      </h3>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-amber-100/50 dark:border-amber-900/50 
                      bg-white dark:bg-gray-900 shadow-sm">
                      <TableLocationSection
                        formData={formData}
                        sections={sections}
                        filteredTables={filteredTables}
                        onTableChange={(tableId) => handleFieldChange("tableId", tableId)}
                        onFieldChange={handleFieldChange}
                      />
                    </div>
                  </div>

                  {/* Rezervasyon Detayları */}
                  <div className="flex flex-col h-full">
                    <div className="flex items-center gap-2 px-1 mb-2">
                      <div className="p-1.5 rounded-md bg-emerald-100 dark:bg-emerald-900/50">
                        <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Rezervasyon Detayları
                      </h3>
                    </div>
                    <div className="flex-1 p-3 rounded-lg border border-emerald-100/50 dark:border-emerald-900/50 
                      bg-white dark:bg-gray-900 shadow-sm">
                      <ReservationDetailsSection formData={formData} onFieldChange={handleFieldChange} />
                    </div>
                  </div>
                </div>

                {/* Alt Bölüm: Notlar */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 px-1 mb-2">
                    <div className="p-1.5 rounded-md bg-rose-100 dark:bg-rose-900/50">
                      <MessageSquare className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                    </div>
                    <h3 className="text-sm font-medium text-rose-600 dark:text-rose-400">
                      Notlar ve Özel İstekler
                    </h3>
                  </div>
                  <div className="p-3 rounded-lg border border-rose-100/50 dark:border-rose-900/50 
                    bg-white dark:bg-gray-900 shadow-sm">
                    <NotesSection formData={formData} onFieldChange={handleFieldChange} />
                  </div>
                </div>
              </form>
            )}
          </div>

          <div className="sticky bottom-0 px-6 py-4 border-t bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
                className="min-w-[100px] bg-background hover:bg-muted/80"
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
                    <span>{initialData?.id ? "Güncelleniyor..." : "Kaydediliyor..."}</span>
                  </div>
                ) : (
                  <span>{initialData?.id ? "Güncelle" : "Kaydet"}</span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
