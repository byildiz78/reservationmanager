import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TableFormProps {
    formData: {
        table_name: string;
        capacity: number;
        section_id: string;
        category_id: string;
        is_active: boolean;
    };
    sections: Array<{
        section_id: number;
        section_name: string;
    }>;
    categories: Array<{
        category_id: number;
        category_name: string;
    }>;
    onSubmit: (e: React.FormEvent) => void;
    onChange: (field: string, value: string | number | boolean) => void;
    isSubmitting: boolean;
    title: string;
    onCancel: () => void;
}

export const TableForm: React.FC<TableFormProps> = ({
    formData,
    sections,
    categories,
    onSubmit,
    onChange,
    isSubmitting,
    title,
    onCancel
}) => {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-[800px] max-h-[90vh] flex flex-col">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-bold">{title}</h2>
                </div>

                <ScrollArea className="flex-1 p-6">
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="table_name">Masa Adı</Label>
                            <Input
                                id="table_name"
                                value={formData.table_name}
                                onChange={(e) => onChange('table_name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="capacity">Kapasite</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => onChange('capacity', parseInt(e.target.value))}
                                min={1}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="section_id">Bölüm</Label>
                            <Select
                                value={formData.section_id}
                                onValueChange={(value) => onChange('section_id', value)}
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
                                onValueChange={(value) => onChange('category_id', value)}
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

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="is_active"
                                checked={formData.is_active}
                                onCheckedChange={(checked) => onChange('is_active', checked)}
                            />
                            <Label htmlFor="is_active">Aktif</Label>
                        </div>
                    </form>
                </ScrollArea>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        form="table-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
