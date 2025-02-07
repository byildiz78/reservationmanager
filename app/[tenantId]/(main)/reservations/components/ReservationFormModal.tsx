"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useReservationStore } from "@/stores/reservation-store";
import { toast } from "@/components/ui/toast/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Calendar as CalendarIcon, Clock, MapPin, Phone, User, MessageSquare, Filter, Building2, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import api from '@/lib/axios';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import cn from "classnames";

interface Table {
  table_id: number;
  table_name: string;
  table_capacity: number;
  table_status: string;
  section_id: number;
  section_name: string;
  section_description: string | null;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean;
}

type LocationType = "salon" | "bahçe" | "teras";
type ReservationType = "normal" | "özel" | "grup";
type ServiceType = "standart" | "vip" | "özel";
type ReservationStatus = "pending" | "awaiting_payment" | "payment_received" | "confirmed" | "customer_arrived" | "customer_no_show" | "customer_cancelled";

interface FormData {
  customerName: string;
  phone: string;
  date: Date;
  time: string;
  persons: string;
  tableId: string;
  type: ReservationType;
  location: LocationType;
  serviceType: ServiceType;
  notes: string;
  specialRequests: string;
  status: ReservationStatus;
}

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
  const [sections, setSections] = useState<Array<{section_id: number, section_name: string}>>([]);
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
      // Set default values for new reservation
      const now = new Date();
      now.setHours(now.getHours() + 1); // Default to 1 hour from now
      
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
      console.log('Setting form data with:', initialData);
      console.log('Initial reservation date:', initialData.reservation_date);
      
      try {
        // Parse date string to Date object
        let dateObj = new Date();
        
        if (initialData.reservation_date) {
          // Create date using local timezone
          dateObj = new Date(initialData.reservation_date);
          console.log('Created date object:', dateObj);
        } else {
          console.warn('No reservation date provided in initialData');
        }

        // Format time string (remove seconds if present)
        const timeStr = initialData.reservation_time?.split(':').slice(0, 2).join(':') || '19:00';
        console.log('Time string:', timeStr);

        // Create new form data
        const newFormData = {
          customerName: initialData.customer_name || '',
          phone: initialData.customer_phone || '',
          date: dateObj,
          time: timeStr,
          persons: String(initialData.party_size) || '2',
          tableId: String(initialData.table_id) || '',
          type: 'normal' as ReservationType,
          location: (initialData.section_name?.toLowerCase() || 'salon') as LocationType,
          serviceType: 'standart' as ServiceType,
          notes: initialData.notes || '',
          specialRequests: initialData.specialnotes || '',
          status: (initialData.status || 'pending') as ReservationStatus
        };

        console.log('Setting form data to:', newFormData);
        setFormData(newFormData);
      } catch (error) {
        console.error('Error setting form data:', error);
        console.error('Error details:', {
          initialData,
          dateString: initialData.reservation_date
        });
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

      // Clear table selection if current table is not in filtered list
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
        location: selectedTable.section_name.toLowerCase() as LocationType
      }));
    }
  };

  // Debug için tables ve formData'yı izle
  useEffect(() => {
    console.log('Tables:', tables);
    console.log('Form Data:', formData);
  }, [tables, formData]);

  // Helper function to ensure valid date for formatting
  const formatDateSafe = (date: Date | null | undefined) => {
    if (!date || isNaN(date.getTime())) {
      console.log('Invalid date:', date);
      return <span>Tarih seçin</span>;
    }
    try {
      const formatted = format(date, "PPP", { locale: tr });
      console.log('Formatted date:', formatted);
      return formatted;
    } catch (error) {
      console.error('Error formatting date:', error);
      return <span>Tarih seçin</span>;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      console.log('Submitting form with data:', formData);
      console.log('Initial data:', initialData);

      // Format date in YYYY-MM-DD format
      const formattedDate = format(formData.date, 'yyyy-MM-dd');
      console.log('Formatted date for submission:', formattedDate);

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

      console.log('Reservation data to submit:', reservationData);

      let response;
      if (initialData?.id) {
        // Update existing reservation
        console.log('Updating reservation with ID:', initialData.id);
        response = await api.put(`/api/postgres/update-reservation?reservationId=${initialData.id}`, reservationData);
      } else {
        // Create new reservation
        console.log('Creating new reservation');
        response = await api.post('/api/postgres/add-reservation', reservationData);
      }

      console.log('API Response:', response);

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

  const handleChange = (field: keyof FormData, value: FormData[keyof FormData]) => {
    setFormData(prevData => ({ ...prevData, [field]: value }));
  };

  // Update the date display in the button
  const dateDisplay = formatDateSafe(formData.date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1100px] p-0 overflow-hidden bg-white dark:bg-gray-950">
        <div className="grid md:grid-cols-[380px,1fr]">
          {/* Sol Panel - Takvim ve Saat Seçimi */}
          <div className="p-8 bg-muted/10 border-r">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-3xl font-semibold bg-gradient-to-r from-primary to-primary/50 text-transparent bg-clip-text">
                {initialData ? "Rezervasyonu Düzenle" : "Yeni Rezervasyon"}
              </DialogTitle>
              <DialogDescription className="text-lg mt-2">
                {initialData ? "Rezervasyon bilgilerini güncelleyin" : "Yeni bir rezervasyon oluşturun"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">Tarih</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !formData.date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateDisplay}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.date}
                          onSelect={(date) => handleChange("date", date)}
                          initialFocus
                          locale={tr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="time">Saat</Label>
                    <Select value={formData.time} onValueChange={(value) => handleChange("time", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="18:00">18:00</SelectItem>
                        <SelectItem value="19:00">19:00</SelectItem>
                        <SelectItem value="20:00">20:00</SelectItem>
                        <SelectItem value="21:00">21:00</SelectItem>
                        <SelectItem value="22:00">22:00</SelectItem>
                        <SelectItem value="23:00">23:00</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Müşteri Bilgileri ve Diğer Detaylar */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm text-muted-foreground">{loadingMessage}</p>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label htmlFor="customerName" className="flex items-center gap-2 text-base">
                            <User className="w-4 h-4 text-primary" />
                            Müşteri Adı
                          </Label>
                          <Input
                            id="customerName"
                            value={formData.customerName}
                            onChange={(e) => handleChange("customerName", e.target.value)}
                            className="h-11 bg-muted/50 text-base"
                          />
                        </div>

                        <div className="grid gap-3">
                          <Label htmlFor="phone" className="flex items-center gap-2 text-base">
                            <Phone className="w-4 h-4 text-primary" />
                            Telefon
                          </Label>
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={(e) => handleChange("phone", e.target.value)}
                            className="h-11 bg-muted/50 text-base"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label className="flex items-center gap-2 text-base">
                            <Users className="w-5 h-5 text-primary" />
                            Kişi Sayısı
                          </Label>
                          <Select
                            value={formData.persons}
                            onValueChange={(value) => handleChange("persons", value)}
                          >
                            <SelectTrigger className="h-11 bg-muted/50 text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
                                <SelectItem key={num} value={num.toString()}>
                                  {num} Kişi
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-3">
                          <Label className="flex items-center gap-2 text-base">
                            <MapPin className="w-5 h-5 text-primary" />
                            Konum
                          </Label>
                          <Select
                            value={formData.location}
                            onValueChange={(value) =>
                              setFormData({ ...formData, location: value as LocationType })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Konum seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {sections.map((section) => (
                                <SelectItem
                                  key={section.section_id}
                                  value={section.section_name.toLowerCase()}
                                >
                                  {section.section_name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="grid gap-3">
                          <Label className="flex items-center gap-2 text-base">
                            <Filter className="w-5 h-5 text-primary" />
                            Masa
                          </Label>
                          <Select
                            value={formData.tableId}
                            onValueChange={handleTableChange}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Masa seçin" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredTables.map((table) => (
                                <SelectItem 
                                  key={table.table_id} 
                                  value={String(table.table_id)}
                                  className="pl-4"
                                >
                                  Masa {table.table_name} ({table.table_capacity} Kişilik)
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid gap-3">
                          <Label className="flex items-center gap-2 text-base">
                            <Filter className="w-5 h-5 text-primary" />
                            Rezervasyon Tipi
                          </Label>
                          <Select
                            value={formData.type}
                            onValueChange={(value: ReservationType) => handleChange("type", value)}
                          >
                            <SelectTrigger className="h-11 bg-muted/50 text-base">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="özel">Özel</SelectItem>
                              <SelectItem value="grup">Grup</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid gap-3">
                        <Label className="flex items-center gap-2 text-base">
                          <UtensilsCrossed className="w-5 h-5 text-primary" />
                          Servis Tercihi
                        </Label>
                        <Select
                          value={formData.serviceType}
                          onValueChange={(value: ServiceType) => handleChange("serviceType", value)}
                        >
                          <SelectTrigger className="h-11 bg-muted/50 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standart">Standart</SelectItem>
                            <SelectItem value="vip">Vip</SelectItem>
                            <SelectItem value="özel">Özel</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3">
                        <Label className="flex items-center gap-2 text-base">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          Rezervasyon Durumu
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: ReservationStatus) => handleChange("status", value)}
                        >
                          <SelectTrigger className="h-11 bg-muted/50 text-base">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Onay Bekliyor</SelectItem>
                            <SelectItem value="awaiting_payment">Ödeme Bekleniyor</SelectItem>
                            <SelectItem value="payment_received">Ödeme Geldi</SelectItem>
                            <SelectItem value="confirmed">Onaylandı</SelectItem>
                            <SelectItem value="customer_arrived">Müşteri Geldi</SelectItem>
                            <SelectItem value="customer_no_show">Müşteri Gelmedi</SelectItem>
                            <SelectItem value="customer_cancelled">Müşteri İptal Etti</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="notes" className="flex items-center gap-2 text-base">
                            <MessageSquare className="w-4 h-4 text-primary" />
                            Notlar
                          </Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => handleChange("notes", e.target.value)}
                            placeholder="Rezervasyon ile ilgili notlar..."
                            className="bg-muted/50 min-h-[100px] text-base"
                          />
                        </div>
                        <div>
                          <Label htmlFor="specialRequests" className="flex items-center gap-2 text-base">
                            <Filter className="w-4 h-4 text-primary" />
                            Özel İstekler
                          </Label>
                          <Textarea
                            id="specialRequests"
                            value={formData.specialRequests}
                            onChange={(e) => handleChange("specialRequests", e.target.value)}
                            placeholder="Müşterinin özel istekleri..."
                            className="bg-muted/50 min-h-[100px] text-base"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  className="w-full md:w-auto"
                  disabled={isSubmitting}
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
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
