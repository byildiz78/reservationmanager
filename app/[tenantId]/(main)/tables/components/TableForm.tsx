import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface TableFormData {
    table_name: string;
    capacity: number;
    section_id: string;
    category_id: string;
    status: "available" | "reserved" | "occupied";
    shape: "rectangle" | "circle";
    position: Position;
    size: Size;
    min_capacity: number;
    max_capacity: number;
    reservation_status: "available" | "reserved" | "occupied";
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
    onSubmit: (e: React.FormEvent) => void;
    onChange: (formData: TableFormData) => void;
    loading: boolean;
    title: string;
    onCancel: () => void;
}

export const TableForm: React.FC<TableFormProps> = ({
    formData,
    sections,
    categories,
    onSubmit,
    onChange,
    loading,
    title,
    onCancel
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
                    <form id="table-form" onSubmit={onSubmit} className="space-y-4">
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
                            <Label htmlFor="shape">Şekil</Label>
                            <Select
                                value={formData.shape}
                                onValueChange={(value) => handleChange('shape', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Şekil seçin" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="rectangle">Dikdörtgen</SelectItem>
                                    <SelectItem value="circle">Daire</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>Konum</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="position_x">X</Label>
                                    <Input
                                        id="position_x"
                                        type="number"
                                        value={formData.position.x}
                                        onChange={(e) => handleChange('position', { ...formData.position, x: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="position_y">Y</Label>
                                    <Input
                                        id="position_y"
                                        type="number"
                                        value={formData.position.y}
                                        onChange={(e) => handleChange('position', { ...formData.position, y: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Boyut</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="size_width">Genişlik</Label>
                                    <Input
                                        id="size_width"
                                        type="number"
                                        value={formData.size.width}
                                        onChange={(e) => handleChange('size', { ...formData.size, width: parseInt(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="size_height">Yükseklik</Label>
                                    <Input
                                        id="size_height"
                                        type="number"
                                        value={formData.size.height}
                                        onChange={(e) => handleChange('size', { ...formData.size, height: parseInt(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <Label>Kapasite Aralığı</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label htmlFor="min_capacity">Min Kapasite</Label>
                                    <Input
                                        id="min_capacity"
                                        type="number"
                                        value={formData.min_capacity}
                                        onChange={(e) => handleChange('min_capacity', parseInt(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="max_capacity">Max Kapasite</Label>
                                    <Input
                                        id="max_capacity"
                                        type="number"
                                        value={formData.max_capacity}
                                        onChange={(e) => handleChange('max_capacity', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
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
