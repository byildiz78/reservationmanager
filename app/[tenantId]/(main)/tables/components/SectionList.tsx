import React from 'react';
import { PencilIcon, Search, Filter } from 'lucide-react';
import { TableList } from './TableList';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface Table {
    table_id: number;
    table_name: string;
    capacity: number;
    status: "available" | "reserved" | "occupied";
    shape: "rectangle" | "circle";
    position: Position;
    size: Size;
    category_name: string;
    min_capacity: number;
    max_capacity: number;
    reservation_status: "available" | "reserved" | "occupied";
}

interface Section {
    section_id: number;
    section_name: string;
    description: string;
    capacity: number | null;
    is_smoking: boolean;
    is_outdoor: boolean;
    is_active: boolean;
    tables: Table[];
}

interface ApiResponse {
    success: boolean;
    data: Section[];
}

interface SectionListProps {
    sections: Section[];
    onEditSection: (section: Section) => void;
    onAddTable: (sectionId: number) => void;
    onEditTable: (table: Table, sectionId: number) => void;
}

export const SectionList: React.FC<SectionListProps> = ({
    sections,
    onEditSection,
    onAddTable,
    onEditTable
}) => {
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedFilter, setSelectedFilter] = React.useState<string>('all');
    const [selectedSection, setSelectedSection] = React.useState<string>('all');

    const filteredSections = sections.filter(section => {
        if (selectedSection !== 'all' && section.section_id.toString() !== selectedSection) {
            return false;
        }

        const hasMatchingTable = section.tables.some((table) =>
            (table.table_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (table.category_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
        );

        return searchTerm === '' || 
               section.section_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               hasMatchingTable;
    });

    const filteredSectionsWithTables = filteredSections.map(section => ({
        ...section,
        tables: section.tables.filter((table) => {
            if (selectedFilter === 'all') return true;
            if (selectedFilter === 'available') return table.reservation_status === 'available';
            if (selectedFilter === 'reserved') return table.reservation_status === 'reserved';
            if (selectedFilter === 'occupied') return table.reservation_status === 'occupied';
            return true;
        })
    }));

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Masa veya bölüm ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                    <Select
                        value={selectedFilter}
                        onValueChange={setSelectedFilter}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Duruma göre filtrele" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tümü</SelectItem>
                            <SelectItem value="available">Müsait</SelectItem>
                            <SelectItem value="reserved">Rezerve</SelectItem>
                            <SelectItem value="occupied">Dolu</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select
                        value={selectedSection}
                        onValueChange={setSelectedSection}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Bölüm seç" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm Bölümler</SelectItem>
                            {sections.map(section => (
                                <SelectItem key={section.section_id} value={section.section_id.toString()}>
                                    {section.section_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchTerm('');
                            setSelectedFilter('all');
                            setSelectedSection('all');
                        }}
                    >
                        Filtreleri Temizle
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {filteredSectionsWithTables.map((section) => (
                    <Card key={section.section_id} className="overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.section_name}</h2>
                                    <p className="text-gray-600 mb-3">{section.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">
                                            {section.tables.length} Masa
                                        </Badge>
                                        {section.is_smoking && (
                                            <Badge variant="destructive">
                                                Sigara İçilebilir
                                            </Badge>
                                        )}
                                        {section.is_outdoor && (
                                            <Badge variant="default" className="bg-green-500">
                                                Açık Alan
                                            </Badge>
                                        )}
                                        {section.is_active && (
                                            <Badge variant="default" className="bg-purple-500">
                                                Aktif
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => onEditSection(section)}
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        onClick={() => onAddTable(section.section_id)}
                                    >
                                        Masa Ekle
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {section.tables.length > 0 ? (
                            <TableList 
                                tables={section.tables} 
                                onEditTable={(table) => onEditTable(table, section.section_id)} 
                            />
                        ) : (
                            <div className="p-8 text-center text-gray-500">
                                Bu bölümde henüz masa bulunmuyor
                            </div>
                        )}
                    </Card>
                ))}

                {filteredSectionsWithTables.length === 0 && (
                    <div className="text-center p-8 bg-white rounded-lg shadow">
                        <div className="text-gray-500">
                            Aranan kriterlere uygun bölüm veya masa bulunamadı
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
