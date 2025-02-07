"use client";

import { Filter, UtensilsCrossed, CheckCircle2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData, ReservationType, ServiceType, ReservationStatus } from "./types";

interface ReservationDetailsSectionProps {
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function ReservationDetailsSection({ formData, onFieldChange }: ReservationDetailsSectionProps) {
  return (
    <>
      <div className="grid gap-3">
        <Label className="flex items-center gap-2 text-base">
          <Filter className="w-5 h-5 text-primary" />
          Rezervasyon Tipi
        </Label>
        <Select
          value={formData.type}
          onValueChange={(value: ReservationType) => onFieldChange("type", value)}
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

      <div className="grid gap-3">
        <Label className="flex items-center gap-2 text-base">
          <UtensilsCrossed className="w-5 h-5 text-primary" />
          Servis Tercihi
        </Label>
        <Select
          value={formData.serviceType}
          onValueChange={(value: ServiceType) => onFieldChange("serviceType", value)}
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
          onValueChange={(value: ReservationStatus) => onFieldChange("status", value)}
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
    </>
  );
}
