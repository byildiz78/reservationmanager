"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

// Move initial form data outside the component to avoid recreating it
const defaultFormData: FormData = {
  customerName: "",
  phone: "",
  date: new Date(),
  time: format(new Date(), 'HH:mm'),
  persons: "2",
  tableId: null,
  tableName: "",
  sectionId: null,
  sectionName: "",
  type: "normal",
  serviceType: "standart",
  notes: "",
  specialRequests: "",
  status: "pending",
  isVip: false,
  isSmoking: false,
  isOutdoor: false
};

export function ReservationFormModal({ isOpen, onClose, initialData, onUpdate }: ReservationFormModalProps) {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Veriler yükleniyor...");
  const [sections, setSections] = useState<Section[]>([]);
  const [filteredTables, setFilteredTables] = useState<Table[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Fetch data and initialize form
  const fetchData = async () => {
    setLoading(true);
    setLoadingMessage('Veriler yükleniyor...');
    try {
      // First load tables and sections
      const [tablesRes, sectionsRes] = await Promise.all([
        api.get('/api/postgres/list-tables'),
        api.get('/api/postgres/list-sections')
      ]);

      // Log raw responses for debugging
      console.log('Raw API responses:', {
        tables: tablesRes.data,
        sections: sectionsRes.data
      });

      // Ensure we're setting arrays for both tables and sections
      const tablesData = Array.isArray(tablesRes.data) ? tablesRes.data : [];
      const sectionsData = Array.isArray(sectionsRes.data.data) ? sectionsRes.data.data.map((section: any) => ({
        section_id: section.section_id,
        section_name: section.section_name,
        description: section.description,
        tables: section.tables
      })) : [];

      console.log('Processed sections data:', sectionsData);

      // Set the tables and sections data first
      setTables(tablesData);
      setSections(sectionsData);

      // Only proceed with form initialization if we have initialData
      if (initialData) {
        // Create a date object from the reservation date string
        const dateStr = initialData.reservation_date;
        const dateObj = new Date(dateStr);
        
        // Get the time from either reservation_time or from the date
        const timeStr = initialData.reservation_time || 
                       dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) ||
                       '19:00';

        console.log('Processing date and time:', {
          originalDateStr: dateStr,
          parsedDate: dateObj,
          timeStr: timeStr
        });

        // Get table ID and name directly from initialData.table
        const effectiveTableId = initialData.table?.table_id || null;
        const effectiveTableName = initialData.table?.table_name || '';

        // Get section ID and name directly from initialData.section
        const effectiveSectionId = initialData.section?.id || null;
        const effectiveSectionName = initialData.section?.name || '';

        // Set filtered tables based on section
        if (effectiveSectionId) {
          const sectionTables = tablesData.filter(table => 
            table.section_id === effectiveSectionId
          );
          setFilteredTables(sectionTables);

          // Log filtered tables for debugging
          console.log('Filtered tables for section:', {
            sectionId: effectiveSectionId,
            tables: sectionTables
          });
        }

        const debugData = {
          timestamp: new Date().toISOString(),
          initialData: {
            raw: initialData,
            processedIds: {
              tableId: effectiveTableId,
              sectionId: effectiveSectionId,
              tableName: effectiveTableName,
              sectionName: effectiveSectionName,
              validation: {
                nestedTableId: initialData.table?.table_id,
                nestedSectionId: initialData.section?.id,
                isTableIdValid: Boolean(effectiveTableId),
                isSectionIdValid: Boolean(effectiveSectionId),
                tablesLoaded: tablesData.length,
                sectionsLoaded: sectionsData.length,
                allTables: tablesData,
                allSections: sectionsData
              }
            }
          }
        };

        console.log('Debug data:', debugData);
        setDebugInfo(JSON.stringify(debugData, null, 2));

        // Set form data with the values we have
        setFormData({
          customerName: initialData.customer_name || "",
          phone: initialData.customer_phone || "",
          email: initialData.customer_email || "",
          partySize: initialData.party_size || 2,
          persons: String(initialData.party_size || 2),
          date: dateObj,
          time: timeStr,
          status: initialData.status || "pending",
          notes: initialData.notes || "",
          specialNotes: initialData.specialnotes || "",
          isSmoking: initialData.is_smoking || false,
          isOutdoor: initialData.is_outdoor || false,
          isVip: initialData.is_vip || false,
          tableId: initialData.table?.table_id ? String(initialData.table.table_id) : null,
          tableName: initialData.table?.table_name || "",
          sectionId: initialData.section?.id ? String(initialData.section.id) : null,
          sectionName: initialData.section?.name || "",
          type: "normal",
          serviceType: "standart",
          specialRequests: ""
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
      const errorData = {
        error: 'Failed to load data',
        details: error.message,
        errorObject: error
      };
      console.log('Error data:', errorData);
      setDebugInfo(JSON.stringify(errorData, null, 2));
      toast({
        title: "Hata",
        description: "Veriler yüklenirken bir hata oluştu.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchData();
    } else {
      setFormData(defaultFormData);
      setDebugInfo('');
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.sectionId) {
      // Find the selected section
      const selectedSection = sections.find(s => String(s.section_id) === formData.sectionId);
      
      // Get tables for the selected section
      if (selectedSection?.tables) {
        setFilteredTables(selectedSection.tables.map(table => ({
          table_id: table.table_id,
          table_name: table.table_name,
          table_capacity: table.capacity,
          table_status: table.status
        })));
      } else {
        setFilteredTables([]);
      }

      console.log('Updated filtered tables for section:', {
        sectionId: formData.sectionId,
        tables: selectedSection?.tables
      });
    } else {
      setFilteredTables([]);
    }
  }, [formData.sectionId, sections]);

  const handleFieldChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prevData => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create a new date at midnight in local timezone
      const localDate = new Date(formData.date);
      localDate.setHours(0, 0, 0, 0);

      // Parse the time string
      const [hours, minutes] = formData.time.split(':').map(Number);
      
      // Set the time on our local date
      localDate.setHours(hours, minutes, 0, 0);

      // Convert to ISO string for API
      const reservationDateTime = localDate.toISOString();

      console.log('Submitting reservation with date:', {
        originalDate: formData.date,
        localDate: localDate,
        timeString: formData.time,
        finalDateTime: reservationDateTime
      });

      const reservationData = {
        customer_name: formData.customerName,
        customer_phone: formData.phone,
        customer_email: '',
        party_size: Number(formData.persons),
        reservation_date: reservationDateTime,
        reservation_time: formData.time,
        status: formData.status,
        notes: formData.notes,
        specialnotes: formData.specialRequests,
        is_smoking: formData.isSmoking,
        is_outdoor: formData.isOutdoor,
        is_vip: formData.isVip,
        table_id: formData.tableId ? Number(formData.tableId) : null,
        section_id: formData.sectionId ? Number(formData.sectionId) : null
      };

      if (initialData?.id) {
        await api.put(`/api/postgres/update-reservation?reservationId=${initialData.id}`, reservationData);
      } else {
        await api.post('/api/postgres/create-reservation', reservationData);
      }

      onClose();
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error submitting reservation:', error);
      toast({
        title: "Hata",
        description: "Rezervasyon kaydedilirken bir hata oluştu.",
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

                {debugInfo && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <Label className="mb-2 text-sm font-medium">Debug Bilgileri</Label>
                    <textarea
                      readOnly
                      value={debugInfo}
                      className="w-full h-48 p-2 text-xs font-mono bg-background border rounded"
                    />
                  </div>
                )}
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
