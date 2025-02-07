"use client";

import { MessageSquare, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "./types";

interface NotesSectionProps {
  formData: FormData;
  onFieldChange: (field: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function NotesSection({ formData, onFieldChange }: NotesSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="notes" className="flex items-center gap-2 text-base">
          <MessageSquare className="w-4 h-4 text-primary" />
          Notlar
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onFieldChange("notes", e.target.value)}
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
          onChange={(e) => onFieldChange("specialRequests", e.target.value)}
          placeholder="Müşterinin özel istekleri..."
          className="bg-muted/50 min-h-[100px] text-base"
        />
      </div>
    </div>
  );
}
