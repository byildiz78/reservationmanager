import React, { useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SectionFormData } from '../types';

interface SectionFormProps {
    formData: SectionFormData;
    onSubmit: () => void;
    onCancel: () => void;
    onChange: (data: SectionFormData) => void;
    title: string;
    formLoading?: boolean;
}

export const SectionForm = React.memo<SectionFormProps>(({
    formData,
    onSubmit,
    onCancel,
    onChange,
    title,
    formLoading = false
}) => {
    const handleChange = useCallback((field: keyof SectionFormData, value: any) => {
        onChange({
            ...formData,
            [field]: value
        });
    }, [formData, onChange]);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[90vh] flex flex-col">
                <div className="p-6 border-b flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                        <p className="text-sm text-gray-500 mt-1">Bölüm bilgilerini düzenleyin</p>
                    </div>
                </div>

                <div className="p-6">
                    <form 
                        id="section-form"
                        onSubmit={async (e) => {
                            e.preventDefault();
                            await onSubmit();
                        }} 
                        className="space-y-6"
                    >
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Temel Bilgiler</h3>
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="section_name" className="text-gray-700">Bölüm Adı</Label>
                                    <Input
                                        id="section_name"
                                        value={formData.section_name}
                                        onChange={(e) => handleChange('section_name', e.target.value)}
                                        className="mt-1"
                                        placeholder="Örn: Teras"
                                        required
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="description" className="text-gray-700">Açıklama</Label>
                                    <Textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => handleChange('description', e.target.value)}
                                        className="mt-1 min-h-[100px]"
                                        placeholder="Bölüm hakkında açıklama yazın"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="capacity" className="text-gray-700">Kapasite</Label>
                                    <Input
                                        id="capacity"
                                        type="number"
                                        value={formData.capacity || 0}
                                        onChange={(e) => handleChange('capacity', parseInt(e.target.value))}
                                        className="mt-1"
                                        placeholder="Bölüm kapasitesi"
                                        min="0"
                                    />
                                </div>

                                <div>
                                    <Label htmlFor="order_number" className="text-gray-700">Sıra Numarası</Label>
                                    <Input
                                        id="order_number"
                                        type="number"
                                        value={formData.order_number || 0}
                                        onChange={(e) => handleChange('order_number', parseInt(e.target.value))}
                                        className="mt-1"
                                        placeholder="Görüntüleme sırası"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Bölüm Özellikleri</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleChange('is_smoking', !formData.is_smoking)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        formData.is_smoking 
                                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className={`p-3 rounded-full ${formData.is_smoking ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13h-6m0 0l-3-3m3 3l3 3M7 13H4a1 1 0 01-1-1V8a1 1 0 011-1h3m10 6h3a1 1 0 001-1V8a1 1 0 00-1-1h-3" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">Sigara İçilebilir</span>
                                        <span className="text-sm">
                                            {formData.is_smoking ? 'Sigara içilebilir alan' : 'Sigara içilemeyen alan'}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleChange('is_outdoor', !formData.is_outdoor)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        formData.is_outdoor 
                                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className={`p-3 rounded-full ${formData.is_outdoor ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">Dış Mekan</span>
                                        <span className="text-sm">
                                            {formData.is_outdoor ? 'Açık hava alanı' : 'Kapalı alan'}
                                        </span>
                                    </div>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleChange('is_vip', !formData.is_vip)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                                        formData.is_vip 
                                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                                        : 'border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex flex-col items-center text-center space-y-2">
                                        <div className={`p-3 rounded-full ${formData.is_vip ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                            </svg>
                                        </div>
                                        <span className="font-medium">VIP</span>
                                        <span className="text-sm">
                                            {formData.is_vip ? 'VIP bölüm' : 'Standart bölüm'}
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Durum</h3>
                            <div className="flex items-center space-x-2">
                                <Input
                                    type="checkbox"
                                    className="w-5 h-5"
                                    checked={formData.is_active}
                                    onChange={(e) => handleChange('is_active', e.target.checked)}
                                />
                                <Label className="text-gray-700 cursor-pointer select-none">
                                    Bu bölüm aktif olarak kullanılıyor
                                </Label>
                            </div>
                        </div>

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
                                disabled={formLoading}
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
                </div>
            </div>
        </div>
    );
});

SectionForm.displayName = 'SectionForm';
