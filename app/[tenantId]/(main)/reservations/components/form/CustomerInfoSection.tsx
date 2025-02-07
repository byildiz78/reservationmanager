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

        <div className="grid gap-3">
          <Label htmlFor="phone" className="flex items-center gap-2 text-base">
            <Phone className="w-4 h-4 text-primary" />
            Telefon
          </Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => onFieldChange("phone", e.target.value)}
            className="h-11 bg-muted/50 text-base"
          />
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
