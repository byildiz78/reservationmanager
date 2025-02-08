import { useState, useEffect, useCallback } from 'react';
import { TableForm } from './TableForm';
import { Table, Section, Category, TableFormData } from '../types';
import api from '@/lib/axios';

interface TableManagerProps {
    sections: Section[];
    categories: Category[];
    onTableUpdate: () => Promise<void>;
    showAddTable: boolean;
    setShowAddTable: (show: boolean) => void;
    selectedTable: Table | null;
    setSelectedTable: (table: Table | null) => void;
    selectedSection: Section | null;
}

export function TableManager({ 
    sections, 
    categories, 
    onTableUpdate,
    showAddTable,
    setShowAddTable,
    selectedTable,
    setSelectedTable,
    selectedSection
}: TableManagerProps) {
    const [formLoading, setFormLoading] = useState(false);
    const [formDataLoading, setFormDataLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tableForm, setTableForm] = useState<TableFormData>({
        table_name: '',
        capacity: 0,
        status: 'available',
        location: '',
        is_active: true,
        section_id: selectedSection?.section_id || 0,
        category_id: 0,
        min_reservation_time: 60,
        max_reservation_time: 180,
        reservation_interval: 15
    });

    useEffect(() => {
        // Form açıldığında ve selectedTable null ise, formu sıfırla ve seçili section'ı ayarla
        if (showAddTable && !selectedTable) {
            setTableForm({
                table_name: '',
                capacity: 0,
                status: 'available',
                location: '',
                is_active: true,
                section_id: selectedSection?.section_id || 0,
                category_id: 0,
                min_reservation_time: 60,
                max_reservation_time: 180,
                reservation_interval: 15
            });
        }
    }, [showAddTable, selectedTable, selectedSection]);

    useEffect(() => {
        // Sadece selectedTable değiştiğinde formu güncelle
        if (selectedTable) {
            setFormDataLoading(true);
            const newFormData = {
                table_name: selectedTable.table_name,
                capacity: selectedTable.capacity,
                status: selectedTable.status,
                location: selectedTable.location || '',
                is_active: selectedTable.is_active,
                section_id: selectedSection?.section_id || 0,
                category_id: selectedTable.category_id || 0,
                min_reservation_time: selectedTable.min_reservation_time || 60,
                max_reservation_time: selectedTable.max_reservation_time || 180,
                reservation_interval: selectedTable.reservation_interval || 15
            };
            setTableForm(newFormData);
            // Kısa bir gecikme ekleyerek loading state'in görünür olmasını sağlıyoruz
            setTimeout(() => {
                setFormDataLoading(false);
            }, 500);
        }
    }, [selectedTable, selectedSection]);

    useEffect(() => {
        if (selectedSection) {
            setTableForm(prev => ({
                ...prev,
                section_id: selectedSection.section_id
            }));
        }
    }, [selectedSection]);

    const handleAddTable = async () => {
        try {
            setFormLoading(true);
            setError(null);

            if (!tableForm.table_name) {
                throw new Error('Masa adı boş olamaz');
            }
            if (!tableForm.section_id) {
                throw new Error('Lütfen bir bölüm seçin');
            }
            if (!tableForm.category_id) {
                throw new Error('Lütfen bir kategori seçin');
            }
            if (tableForm.capacity <= 0) {
                throw new Error('Kapasite 0\'dan büyük olmalıdır');
            }

            // API isteği için verileri hazırla
            const apiData = {
                ...tableForm,
                section_id: tableForm.section_id,
                category_id: tableForm.category_id,
                branch_id: 1 // TODO: Get from context or props
            };

            const response = await api.post('/api/postgres/tables', apiData);
            
            if (response.data.success) {
                await onTableUpdate();
                setShowAddTable(false);
                setSelectedTable(null);
                setError(null);
            } else {
                throw new Error(response.data.error || 'Masa eklenirken bir hata oluştu');
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
            console.error('Add Table Error:', err);
        } finally {
            setFormLoading(false);
        }
    };

    const handleUpdateTable = async () => {
        if (!selectedTable) return;

        try {
            setFormLoading(true);
            setError(null);

            if (!tableForm.table_name) {
                throw new Error('Masa adı boş olamaz');
            }
            if (!tableForm.section_id) {
                throw new Error('Lütfen bir bölüm seçin');
            }
            if (!tableForm.category_id) {
                throw new Error('Lütfen bir kategori seçin');
            }
            if (tableForm.capacity <= 0) {
                throw new Error('Kapasite 0\'dan büyük olmalıdır');
            }

            // API isteği için verileri hazırla
            const apiData = {
                ...tableForm,
                section_id: tableForm.section_id,
                category_id: tableForm.category_id,
                branch_id: 1, // TODO: Get from context or props
                table_id: selectedTable.table_id
            };

            const response = await api.put(`/api/postgres/tables/${selectedTable.table_id}`, apiData);
            
            if (response.data.success) {
                await onTableUpdate();
                setShowAddTable(false);
                setSelectedTable(null);
                setError(null);
            } else {
                throw new Error(response.data.error || 'Masa güncellenirken bir hata oluştu');
            }
        } catch (err: any) {
            setError(err.message || 'Bir hata oluştu');
            console.error('Update Table Error:', err);
        } finally {
            setFormLoading(false);
        }
    };

    const resetTableForm = useCallback(() => {
        setTableForm({
            table_name: '',
            capacity: 0,
            status: 'available',
            location: '',
            is_active: true,
            section_id: selectedSection?.section_id || 0,
            category_id: 0,
            min_reservation_time: 60,
            max_reservation_time: 180,
            reservation_interval: 15
        });
    }, [selectedSection]);

    return (
        <>
            {showAddTable && (
                <TableForm
                    formData={tableForm}
                    sections={sections}
                    categories={categories}
                    onSubmit={selectedTable ? handleUpdateTable : handleAddTable}
                    onCancel={() => {
                        setShowAddTable(false);
                        setSelectedTable(null);
                        setError(null);
                        resetTableForm();
                    }}
                    onChange={setTableForm}
                    title={selectedTable ? 'Masa Düzenle' : 'Yeni Masa Ekle'}
                    formLoading={formLoading}
                    dataLoading={formDataLoading}
                />
            )}
        </>
    );
}
