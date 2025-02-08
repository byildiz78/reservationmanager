"use client";

import { User, Phone, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData } from "./types";

interface CustomerInfoSectionProps {
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function CustomerInfoSection({ formData, onFieldChange }: CustomerInfoSectionProps) {
  const handlePhoneChange = (value: string) => {
    // Sadece rakamları al
    const numericValue = value.replace(/\D/g, '');
    // 5 ile başlamasını kontrol et
    if (numericValue.length > 0 && numericValue[0] !== '5') {
      return;
    }
    // Maksimum 10 rakam
    if (numericValue.length <= 10) {
      onFieldChange('phone', numericValue);
    }
  };

  return (
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
            onChange={(e) => onFieldChange("customerName", e.target.value)}
            className="h-11 bg-muted/50 text-base"
          />
        </div>

        <div className="flex gap-2">
          <div className="w-24">
            <Label htmlFor="phoneCode" className="flex items-center gap-2 text-base">
              <Phone className="w-4 h-4 text-primary" />
              Kod
            </Label>
            <Input
              id="phoneCode"
              value="+90"
              disabled
              className="h-11 bg-muted"
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="phone" className="flex items-center gap-2 text-base">
              <Phone className="w-4 h-4 text-primary" />
              Telefon Numarası
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              className="h-11 bg-muted/50 text-base"
              placeholder="5XX XXX XX XX"
              maxLength={10}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-3">
        <Label className="flex items-center gap-2 text-base">
          <Users className="w-5 h-5 text-primary" />
          Kişi Sayısı
        </Label>
        <Select
          value={formData.persons}
          onValueChange={(value) => onFieldChange("persons", value)}
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
    </div>
  );
}
