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

interface SectionListProps {
    sections: any[];
    onEditSection: (section: any) => void;
    onAddTable: (sectionId: string) => void;
    onEditTable: (table: any, sectionId: string) => void;
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
        if (selectedSection !== 'all' && section.id !== selectedSection) {
            return false;
        }

        const hasMatchingTable = section.tables.some((table: any) =>
            table.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            table.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            table.category?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return searchTerm === '' || 
               section.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
               hasMatchingTable;
    });

    const filteredSectionsWithTables = filteredSections.map(section => ({
        ...section,
        tables: section.tables.filter((table: any) => {
            if (selectedFilter === 'all') return true;
            if (selectedFilter === 'available') return table.reservationStatus === 'available';
            if (selectedFilter === 'reserved') return table.reservationStatus === 'reserved';
            if (selectedFilter === 'occupied') return table.reservationStatus === 'occupied';
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
                                <SelectItem key={section.id} value={section.id}>
                                    {section.name}
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
                    <Card key={section.id} className="overflow-hidden">
                        <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{section.name}</h2>
                                    <p className="text-gray-600 mb-3">{section.description}</p>
                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">
                                            {section.tables.length} Masa
                                        </Badge>
                                        {section.isSmoking && (
                                            <Badge variant="destructive">
                                                Sigara İçilebilir
                                            </Badge>
                                        )}
                                        {section.isOutdoor && (
                                            <Badge variant="default" className="bg-green-500">
                                                Açık Alan
                                            </Badge>
                                        )}
                                        {section.isVip && (
                                            <Badge variant="default" className="bg-purple-500">
                                                VIP
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
                                        onClick={() => onAddTable(section.id)}
                                    >
                                        Masa Ekle
                                    </Button>
                                </div>
                            </div>
                        </div>
                        {section.tables.length > 0 ? (
                            <TableList 
                                tables={section.tables} 
                                onEditTable={(table) => onEditTable(table, section.id)} 
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
