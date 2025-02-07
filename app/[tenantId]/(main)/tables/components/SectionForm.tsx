import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SectionFormProps {
    formData: {
        section_name: string;
        description: string;
        capacity: number;
        is_smoking: boolean;
        is_outdoor: boolean;
        is_vip: boolean;
        order_number: number;
    };
    onSubmit: (e: React.FormEvent) => void;
    onChange: (field: string, value: string | number | boolean) => void;
    isSubmitting: boolean;
    title: string;
}

export const SectionForm: React.FC<SectionFormProps> = ({
    formData,
    onSubmit,
    onChange,
    isSubmitting,
    title
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
                            <Label htmlFor="section_name">Bölüm Adı</Label>
                            <Input
                                id="section_name"
                                value={formData.section_name}
                                onChange={(e) => onChange('section_name', e.target.value)}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="description">Açıklama</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => onChange('description', e.target.value)}
                                rows={3}
                            />
                        </div>

                        <div>
                            <Label htmlFor="capacity">Kapasite</Label>
                            <Input
                                id="capacity"
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => onChange('capacity', parseInt(e.target.value))}
                                min={0}
                            />
                        </div>

                        <div>
                            <Label htmlFor="order_number">Sıra No</Label>
                            <Input
                                id="order_number"
                                type="number"
                                value={formData.order_number}
                                onChange={(e) => onChange('order_number', parseInt(e.target.value))}
                                min={0}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Toggle
                                id="is_smoking"
                                pressed={formData.is_smoking}
                                onPressedChange={(pressed) => onChange('is_smoking', pressed)}
                                aria-label="Sigara İçilebilir"
                            >
                                Sigara İçilebilir
                            </Toggle>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Toggle
                                id="is_outdoor"
                                pressed={formData.is_outdoor}
                                onPressedChange={(pressed) => onChange('is_outdoor', pressed)}
                                aria-label="Dış Mekan"
                            >
                                Dış Mekan
                            </Toggle>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Toggle
                                id="is_vip"
                                pressed={formData.is_vip}
                                onPressedChange={(pressed) => onChange('is_vip', pressed)}
                                aria-label="VIP"
                            >
                                VIP
                            </Toggle>
                        </div>
                    </form>
                </ScrollArea>

                <div className="p-6 border-t bg-gray-50 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        onClick={() => onSubmit}
                        disabled={isSubmitting}
                    >
                        İptal
                    </Button>
                    <Button
                        type="submit"
                        form="section-form"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </div>
        </div>
    );
};
