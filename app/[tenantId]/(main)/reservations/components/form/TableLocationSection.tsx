"use client";

import { MapPin, Filter } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormData, Table } from "./types";

interface TableLocationSectionProps {
  formData: FormData;
  sections: Array<{ section_id: number; section_name: string }>;
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
    <div className="grid md:grid-cols-2 gap-6">
      <div className="grid gap-3">
        <Label className="flex items-center gap-2 text-base">
          <MapPin className="w-5 h-5 text-primary" />
          Konum
        </Label>
        <Select
          value={formData.location}
          onValueChange={(value) => onFieldChange("location", value)}
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

      <div className="grid gap-3">
        <Label className="flex items-center gap-2 text-base">
          <Filter className="w-5 h-5 text-primary" />
          Masa
        </Label>
        <Select value={formData.tableId} onValueChange={onTableChange}>
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
    </div>
  );
}
