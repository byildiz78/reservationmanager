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
import { ReservationType, LocationType, ServiceType } from "@/types/reservation-types";
import { Users, Calendar as CalendarIcon, Clock, MapPin, Phone, User, MessageSquare, Filter, Building2, UtensilsCrossed } from "lucide-react";

interface ReservationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export function ReservationFormModal({ isOpen, onClose, initialData }: ReservationFormModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    date: new Date(),
    time: "19:00",
    persons: "2",
    tableId: "1",
    type: "regular" as ReservationType,
    location: "salon" as LocationType,
    serviceType: "standard" as ServiceType,
    notes: "",
    specialRequests: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        date: new Date(initialData.date),
      });
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API call would go here
    toast({
      title: initialData ? "Rezervasyon güncellendi" : "Yeni rezervasyon oluşturuldu",
      description: "İşlem başarıyla tamamlandı.",
    });
    onClose();
  };

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

            <div className="space-y-6">
              <Calendar
                mode="single"
                selected={formData.date}
                onSelect={(date) => date && setFormData({ ...formData, date })}
                className="rounded-xl border shadow-sm p-4"
                locale={tr}
                modifiers={{
                  weekend: (date) => date.getDay() === 5 || date.getDay() === 6
                }}
                modifiersStyles={{
                  weekend: {
                    color: 'rgb(239 68 68)',
                    fontWeight: '600',
                    backgroundColor: 'rgb(254 242 242)',
                    borderRadius: '4px'
                  }
                }}
              />

              <div className="pt-6 border-t">
                <Label className="flex items-center gap-2 mb-4 text-base font-medium">
                  <Clock className="w-5 h-5 text-primary" />
                  Saat Seçimi
                </Label>
                <div className="grid grid-cols-4 gap-3">
                  {["18:00", "19:00", "20:00", "21:00", "22:00", "23:00"].map((time) => (
                    <Button
                      key={time}
                      type="button"
                      variant={formData.time === time ? "default" : "outline"}
                      className={`h-11 text-base font-medium transition-all ${
                        formData.time === time 
                          ? "bg-primary text-primary-foreground shadow-lg scale-105" 
                          : "hover:bg-primary/10"
                      }`}
                      onClick={() => setFormData({ ...formData, time })}
                    >
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sağ Panel - Müşteri Bilgileri ve Diğer Detaylar */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label className="flex items-center gap-2 text-base">
                      <User className="w-5 h-5 text-primary" />
                      Müşteri Adı
                    </Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      className="h-11 bg-muted/50 text-base"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label className="flex items-center gap-2 text-base">
                      <Phone className="w-5 h-5 text-primary" />
                      Telefon
                    </Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
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
                      onValueChange={(value) => setFormData({ ...formData, persons: value })}
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
                      Masa No
                    </Label>
                    <Select
                      value={formData.tableId}
                      onValueChange={(value) => setFormData({ ...formData, tableId: value })}
                    >
                      <SelectTrigger className="h-11 bg-muted/50 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 20 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            Masa {num}
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
                      Rezervasyon Tipi
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value: ReservationType) => setFormData({ ...formData, type: value })}
                    >
                      <SelectTrigger className="h-11 bg-muted/50 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Normal</SelectItem>
                        <SelectItem value="birthday">Doğum Günü</SelectItem>
                        <SelectItem value="anniversary">Yıl Dönümü</SelectItem>
                        <SelectItem value="meeting">İş Yemeği</SelectItem>
                        <SelectItem value="special">Özel Gün</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-3">
                    <Label className="flex items-center gap-2 text-base">
                      <Building2 className="w-5 h-5 text-primary" />
                      Konum
                    </Label>
                    <Select
                      value={formData.location}
                      onValueChange={(value: LocationType) => setFormData({ ...formData, location: value })}
                    >
                      <SelectTrigger className="h-11 bg-muted/50 text-base">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="salon">Salon</SelectItem>
                        <SelectItem value="terrace">Teras</SelectItem>
                        <SelectItem value="upstairs">Üst Kat</SelectItem>
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
                    onValueChange={(value: ServiceType) => setFormData({ ...formData, serviceType: value })}
                  >
                    <SelectTrigger className="h-11 bg-muted/50 text-base">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alacarte">A La Carte</SelectItem>
                      <SelectItem value="fixmenu">Fix Menü</SelectItem>
                      <SelectItem value="standard">Standart</SelectItem>
                      <SelectItem value="special">Özel İstek</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-5 h-5 text-primary" />
                    Notlar
                  </Label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Rezervasyon ile ilgili notlar..."
                    className="bg-muted/50 min-h-[100px] text-base"
                  />
                </div>

                <div className="grid gap-3">
                  <Label className="flex items-center gap-2 text-base">
                    <Filter className="w-5 h-5 text-primary" />
                    Özel İstekler
                  </Label>
                  <Textarea
                    value={formData.specialRequests}
                    onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                    placeholder="Müşterinin özel istekleri..."
                    className="bg-muted/50 min-h-[100px] text-base"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                  className="h-11 px-6 text-base"
                >
                  İptal
                </Button>
                <Button 
                  type="submit" 
                  className="h-11 px-6 text-base bg-primary hover:bg-primary/90"
                >
                  {initialData ? "Güncelle" : "Oluştur"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
