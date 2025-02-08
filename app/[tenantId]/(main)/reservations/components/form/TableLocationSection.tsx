"use client";

import { MapPin, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { FormData, Section, Table } from "./types";

interface TableLocationSectionProps {
  formData: FormData;
  sections: Section[];
  filteredTables: Table[];
  onTableChange: (tableId: string) => void;
  onFieldChange: (field: keyof FormData, value: FormData[keyof FormData]) => void;
}

export function TableLocationSection({
  formData,
  sections,
  filteredTables,
  onTableChange,
  onFieldChange,
}: TableLocationSectionProps) {
  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          Bölüm
        </Label>
        <Select
          value={formData.sectionId}
          onValueChange={(value) => onFieldChange("sectionId", value)}
        >
          <SelectTrigger className="w-full h-11 bg-muted/50">
            <SelectValue placeholder="Bölüm seçin" />
          </SelectTrigger>
          <SelectContent>
            {sections.map((section) => (
              <SelectItem 
                key={section.section_id} 
                value={String(section.section_id)}
              >
                {section.section_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          Masa
        </Label>
        <Select
          value={formData.tableId}
          onValueChange={onTableChange}
          disabled={!formData.sectionId}
        >
          <SelectTrigger className="w-full h-11 bg-muted/50">
            <SelectValue placeholder="Masa seçin" />
          </SelectTrigger>
          <SelectContent>
            {filteredTables.map((table) => (
              <SelectItem 
                key={table.table_id} 
                value={String(table.table_id)}
              >
                {table.table_name} ({table.table_capacity} Kişilik)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-primary" />
          Kişi Sayısı
        </Label>
        <Input
          type="number"
          value={formData.persons}
          onChange={(e) =>
            onFieldChange("persons", e.target.value)
          }
          min={1}
          className="w-full h-11 bg-muted/50"
        />
      </div>
    </div>
  );
}
