import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableFormData {
    table_name: string;
    capacity: number;
    section_id: number;
    category_id: number;
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
        min_capacity: number;
        max_capacity: number;
    }>;
    onSubmit: () => void;
    onCancel: () => void;
    onChange: (data: TableFormData) => void;
    title: string;
    formLoading?: boolean;
    dataLoading?: boolean;
}

export const TableForm = React.memo<TableFormProps>(({
    formData,
    sections,
    categories,
    onSubmit,
    onCancel,
    onChange,
    title,
    formLoading = false,
    dataLoading = false
}) => {
    const handleChange = useCallback((field: keyof TableFormData, value: any) => {
        onChange({
            ...formData,
            [field]: value
        });
    }, [formData, onChange]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[900px] max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Masa bilgilerini düzenleyin</p>
                    </div>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <form 
                        id="table-form"
                        onSubmit={(e) => {
                            e.preventDefault();
                            onSubmit();
                        }} 
                        className="space-y-6"
                    >
                        {dataLoading ? (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                <p className="text-gray-600">Form yükleniyor...</p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Temel Bilgiler</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="table_name" className="text-gray-700">Masa Adı</Label>
                                                <Input
                                                    id="table_name"
                                                    value={formData.table_name}
                                                    onChange={(e) => handleChange('table_name', e.target.value)}
                                                    required
                                                    className="mt-1"
                                                    placeholder="Örn: Masa 1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="capacity" className="text-gray-700">Kapasite</Label>
                                                <Input
                                                    id="capacity"
                                                    type="number"
                                                    value={formData.capacity}
                                                    onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                                                    min={1}
                                                    required
                                                    className="mt-1"
                                                    placeholder="Masa kapasitesi"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Konum Bilgileri</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="section_id" className="text-gray-700">Bölüm</Label>
                                                <Select
                                                    value={formData.section_id}
                                                    onValueChange={(value) => handleChange('section_id', parseInt(value))}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Bölüm seçin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {sections.map((section) => (
                                                            <SelectItem 
                                                                key={section.section_id} 
                                                                value={section.section_id}
                                                            >
                                                                {section.section_name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="location" className="text-gray-700">Konum Detayı</Label>
                                                <Input
                                                    id="location"
                                                    value={formData.location}
                                                    onChange={(e) => handleChange('location', e.target.value)}
                                                    className="mt-1"
                                                    placeholder="Örn: Pencere kenarı"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Kategori ve Durum</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="category_id" className="text-gray-700">Kategori</Label>
                                                <Select
                                                    value={formData.category_id ? formData.category_id.toString() : ''}
                                                    onValueChange={(value) => handleChange('category_id', parseInt(value))}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Kategori seçin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {categories.map((category) => (
                                                            <SelectItem 
                                                                key={category.category_id} 
                                                                value={category.category_id.toString()}
                                                            >
                                                                {category.category_name} ({category.min_capacity}-{category.max_capacity} kişilik)
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div>
                                                <Label htmlFor="status" className="text-gray-700">Durum</Label>
                                                <Select
                                                    value={formData.status}
                                                    onValueChange={(value) => handleChange('status', value)}
                                                >
                                                    <SelectTrigger className="mt-1">
                                                        <SelectValue placeholder="Durum seçin" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="available">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 rounded-full bg-green-500 mr-2" />
                                                                Müsait
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="reserved">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 rounded-full bg-yellow-500 mr-2" />
                                                                Rezerve
                                                            </div>
                                                        </SelectItem>
                                                        <SelectItem value="occupied">
                                                            <div className="flex items-center">
                                                                <div className="w-2 h-2 rounded-full bg-red-500 mr-2" />
                                                                Dolu
                                                            </div>
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-4">Rezervasyon Ayarları</h3>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <Label htmlFor="min_reservation_time" className="text-gray-700">Min. Süre (dk)</Label>
                                                <Input
                                                    id="min_reservation_time"
                                                    type="number"
                                                    value={formData.min_reservation_time}
                                                    onChange={(e) => handleChange('min_reservation_time', parseInt(e.target.value))}
                                                    min={15}
                                                    step={15}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="max_reservation_time" className="text-gray-700">Max. Süre (dk)</Label>
                                                <Input
                                                    id="max_reservation_time"
                                                    type="number"
                                                    value={formData.max_reservation_time}
                                                    onChange={(e) => handleChange('max_reservation_time', parseInt(e.target.value))}
                                                    min={30}
                                                    step={15}
                                                    className="mt-1"
                                                />
                                            </div>

                                            <div>
                                                <Label htmlFor="reservation_interval" className="text-gray-700">Aralık (dk)</Label>
                                                <Input
                                                    id="reservation_interval"
                                                    type="number"
                                                    value={formData.reservation_interval}
                                                    onChange={(e) => handleChange('reservation_interval', parseInt(e.target.value))}
                                                    min={15}
                                                    step={15}
                                                    className="mt-1"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-2">
                                        <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
                                            <Input
                                                type="checkbox"
                                                className="w-5 h-5"
                                                checked={formData.is_active}
                                                onChange={(e) => handleChange('is_active', e.target.checked)}
                                            />
                                            <Label className="text-gray-700 cursor-pointer select-none">Bu masa aktif olarak kullanılıyor</Label>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end space-x-3 pt-6 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={formLoading}
                                className="min-w-[100px]"
                            >
                                İptal
                            </Button>
                            <Button 
                                type="submit"
                                disabled={formLoading || dataLoading}
                                className="min-w-[100px] bg-blue-600 hover:bg-blue-700"
                            >
                                {formLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                                        <span>Kaydediliyor...</span>
                                    </div>
                                ) : (
                                    'Kaydet'
                                )}
                            </Button>
                        </div>
                    </form>
                </ScrollArea>
            </div>
        </div>
    );
});

TableForm.displayName = 'TableForm';
