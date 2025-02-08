import { useState, useEffect } from 'react';
import { SectionForm } from './SectionForm';
import { Section, SectionFormData } from '../types';
import api from '@/lib/axios';

interface SectionManagerProps {
    onSectionUpdate: () => Promise<void>;
    showAddSection: boolean;
    setShowAddSection: (show: boolean) => void;
    selectedSection: Section | null;
    setSelectedSection: (section: Section | null) => void;
}

export function SectionManager({ 
    onSectionUpdate, 
    showAddSection, 
    setShowAddSection,
    selectedSection,
    setSelectedSection
}: SectionManagerProps) {
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sectionForm, setSectionForm] = useState<SectionFormData>({
        section_name: '',
        description: '',
        capacity: 0,
        is_smoking: false,
        is_outdoor: false,
        is_vip: false,
        is_active: true,
        order_number: 0
    });

    useEffect(() => {
        if (selectedSection) {
            setSectionForm({
                section_name: selectedSection.section_name,
                description: selectedSection.description || '',
                capacity: selectedSection.capacity || 0,
                is_smoking: selectedSection.is_smoking,
                is_outdoor: selectedSection.is_outdoor,
                is_vip: selectedSection.is_vip,
                is_active: selectedSection.is_active,
                order_number: selectedSection.order_number || 0
            });
        } else {
            resetSectionForm();
        }
    }, [selectedSection]);

    const handleAddSection = async () => {
        try {
            setFormLoading(true);
            setError(null);

            const response = await api.post('/api/postgres/sections', {
                ...sectionForm,
                branch_id: 1
            });
            
            const data = response.data;
            
            if (data.success) {
                await onSectionUpdate();
                setShowAddSection(false);
                resetSectionForm();
            } else {
                throw new Error(data.error || 'Bölüm eklenirken bir hata oluştu');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Bölüm eklenirken bir hata oluştu');
            console.error('Add Section Error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditSection = async () => {
        if (!selectedSection) return;

        try {
            setFormLoading(true);
            setError(null);

            const response = await api.put(`/api/postgres/sections/${selectedSection.section_id}`, {
                ...sectionForm,
                branch_id: 1
            });
            
            const data = response.data;
            
            if (data.success) {
                await onSectionUpdate();
                setShowAddSection(false);
                setSelectedSection(null);
                resetSectionForm();
            } else {
                throw new Error(data.error || 'Bölüm güncellenirken bir hata oluştu');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Bölüm güncellenirken bir hata oluştu');
            console.error('Edit Section Error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const resetSectionForm = () => {
        setSectionForm({
            section_name: '',
            description: '',
            capacity: 0,
            is_smoking: false,
            is_outdoor: false,
            is_vip: false,
            is_active: true,
            order_number: 0
        });
    };

    return (
        <>
            {showAddSection && (
                <SectionForm
                    formData={sectionForm}
                    onSubmit={selectedSection ? handleEditSection : handleAddSection}
                    onCancel={() => {
                        setShowAddSection(false);
                        setSelectedSection(null);
                        setError(null);
                        resetSectionForm();
                    }}
                    onChange={setSectionForm}
                    title={selectedSection ? "Bölüm Düzenle" : "Yeni Bölüm Ekle"}
                    formLoading={formLoading}
                />
            )}
        </>
    );
}
