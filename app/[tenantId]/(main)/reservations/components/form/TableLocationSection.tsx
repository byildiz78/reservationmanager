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
  console.log('TableLocationSection props:', {
    formData,
    sections,
    filteredTables,
    currentSectionId: formData.sectionId,
    currentTableId: formData.tableId
  });

  return (
    <div className="space-y-4">
      <div>
        <Label className="flex items-center gap-2 mb-2">
          <MapPin className="w-4 h-4 text-primary" />
          Bölüm
        </Label>
        <Select
          value={formData.sectionId || ''}
          onValueChange={(value) => {
            console.log('Section selected:', value);
            onFieldChange("sectionId", value);
            onFieldChange("sectionName", sections.find(s => String(s.section_id) === value)?.section_name || '');
          }}
        >
          <SelectTrigger className="w-full h-11 bg-muted/50">
            <SelectValue placeholder="Bölüm seçin">
              {formData.sectionName || "Bölüm seçin"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(sections) && sections.map((section) => (
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
          value={formData.tableId || ''}
          onValueChange={(value) => {
            console.log('Table selected:', value);
            onTableChange(value);
            const selectedTable = filteredTables.find(t => String(t.table_id) === value);
            if (selectedTable) {
              onFieldChange("tableName", selectedTable.table_name);
            }
          }}
          disabled={!formData.sectionId}
        >
          <SelectTrigger className="w-full h-11 bg-muted/50">
            <SelectValue placeholder="Masa seçin">
              {formData.tableName || "Masa seçin"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(filteredTables) && filteredTables.map((table) => (
              <SelectItem 
                key={table.table_id} 
                value={String(table.table_id)}
              >
                {table.table_name} ({table.table_capacity || 0} Kişilik)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
