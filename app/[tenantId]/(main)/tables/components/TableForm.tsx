import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableFormData {
    table_name: string;
    capacity: number;
    section_id: string;
    category_id: string;
    status: "available" | "reserved" | "occupied";
    location: string;
    min_reservation_time: number;
    max_reservation_time: number;
    reservation_interval: number;
    is_active: boolean;
}

interface TableFormProps {
    formData: TableFormData;
    sections: Array<{
        section_id: number;
        section_name: string;
    }>;
    categories: Array<{
        category_id: number;
        category_name: string;
    }>;
    onSubmit: () => void;
    onCancel: () => void;
    onChange: (data: TableFormData) => void;
    title: string;
    loading?: boolean;
}

export const TableForm: React.FC<TableFormProps> = ({
    formData,
    sections,
    categories,
    onSubmit,
    onCancel,
    onChange,
    title,
    loading = false
}) => {
    const handleChange = (field: keyof TableFormData, value: any) => {
        onChange({
            ...formData,
            [field]: value
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }} className="space-y-4">
                        <div>
                            <Label htmlFor="table_name">Masa Adı</Label>
                            <Input
                                id="table_name"
                                value={formData.table_name}
                                onChange={(e) => handleChange('table_name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="capacity">Kapasite</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="section_id">Bölüm</Label>
                            <Select
                                value={formData.section_id}
                                onValueChange={(value) => handleChange('section_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Bölüm seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {sections.map((section) => (
                                        <SelectItem key={section.section_id} value={section.section_id.toString()}>
                                            {section.section_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="category_id">Kategori</Label>
                            <Select
                                value={formData.category_id}
                                onValueChange={(value) => handleChange('category_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Kategori seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    {categories.map((category) => (
                                        <SelectItem key={category.category_id} value={category.category_id.toString()}>
                                            {category.category_name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="status">Durum</Label>
                            <Select
                                value={formData.status}
                                onValueChange={(value) => handleChange('status', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Durum seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="available">Müsait</SelectItem>
                                    <SelectItem value="reserved">Rezerve</SelectItem>
                                    <SelectItem value="occupied">Dolu</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="location">Konum</Label>
                            <Input
                                id="location"
                                value={formData.location}
                                onChange={(e) => handleChange('location', e.target.value)}
                            />
                        </div>

                        <div>
                            <Label htmlFor="min_reservation_time">Min. Rezervasyon Süresi (dk)</Label>
                            <Input
                                id="min_reservation_time"
                                type="number"
                                value={formData.min_reservation_time}
                                onChange={(e) => handleChange('min_reservation_time', parseInt(e.target.value))}
                                min={15}
                                step={15}
                            />
                        </div>

                        <div>
                            <Label htmlFor="max_reservation_time">Max. Rezervasyon Süresi (dk)</Label>
                            <Input
                                id="max_reservation_time"
                                type="number"
                                value={formData.max_reservation_time}
                                onChange={(e) => handleChange('max_reservation_time', parseInt(e.target.value))}
                                min={30}
                                step={15}
                            />
                        </div>

                        <div>
                            <Label htmlFor="reservation_interval">Rezervasyon Aralığı (dk)</Label>
                            <Input
                                id="reservation_interval"
                                type="number"
                                value={formData.reservation_interval}
                                onChange={(e) => handleChange('reservation_interval', parseInt(e.target.value))}
                                min={15}
                                step={15}
                            />
                        </div>

                        <div>
                            <Label> Aktif/Pasif</Label>
                            <div className="flex items-center">
                                <Input
                                    type="checkbox"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                />
                                <span className="ml-2">Aktif</span>
                            </div>
                        </div>
                    </form>
                </ScrollArea>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        form="table-form"
                        disabled={loading}
                    >
                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
