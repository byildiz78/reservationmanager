import { useState, useEffect } from 'react';
import { TableForm } from './TableForm';
import { Table, Section, Category, TableFormData } from '../types';

interface TableManagerProps {
    sections: Section[];
    categories: Category[];
    onTableUpdate: () => Promise<void>;
    showAddTable: boolean;
    setShowAddTable: (show: boolean) => void;
    selectedTable: Table | null;
    setSelectedTable: (table: Table | null) => void;
    selectedSectionId?: string;
}

export function TableManager({ 
    sections, 
    categories, 
    onTableUpdate,
    showAddTable,
    setShowAddTable,
    selectedTable,
    setSelectedTable,
    selectedSectionId
}: TableManagerProps) {
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [tableForm, setTableForm] = useState<TableFormData>({
        table_name: '',
        capacity: 0,
        status: 'available',
        location: '',
        is_active: true,
        section_id: selectedSectionId,
        category_id: '',
        min_reservation_time: 60,
        max_reservation_time: 180,
        reservation_interval: 15
    });

    useEffect(() => {
        if (selectedTable) {
            setTableForm({
                table_name: selectedTable.table_name,
                capacity: selectedTable.capacity,
                status: selectedTable.status,
                location: selectedTable.location || '',
                is_active: selectedTable.is_active,
                section_id: selectedTable.section_id?.toString(),
                category_id: selectedTable.category_id?.toString(),
                min_reservation_time: selectedTable.min_reservation_time,
                max_reservation_time: selectedTable.max_reservation_time,
                reservation_interval: selectedTable.reservation_interval
            });
        } else {
            resetTableForm();
        }
    }, [selectedTable, selectedSectionId]);

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
            if (tableForm.capacity <= 0) {
                throw new Error('Kapasite 0\'dan büyük olmalıdır');
            }

            const response = await fetch('/franchisemanager/api/postgres/add-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tableForm),
            });

            const data = await response.json();
            
            if (data.success) {
                await onTableUpdate();
                setShowAddTable(false);
                resetTableForm();
            } else {
                throw new Error(data.error || 'Masa eklenirken bir hata oluştu');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Masa eklenirken bir hata oluştu');
            console.error('Add Table Error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const handleEditTable = async () => {
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
            if (tableForm.capacity <= 0) {
                throw new Error('Kapasite 0\'dan büyük olmalıdır');
            }

            const response = await fetch('/franchisemanager/api/postgres/update-table', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...tableForm,
                    table_id: selectedTable.table_id
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                await onTableUpdate();
                setShowAddTable(false);
                setSelectedTable(null);
                resetTableForm();
            } else {
                throw new Error(data.error || 'Masa güncellenirken bir hata oluştu');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Masa güncellenirken bir hata oluştu');
            console.error('Update Table Error:', error);
        } finally {
            setFormLoading(false);
        }
    };

    const resetTableForm = () => {
        setTableForm({
            table_name: '',
            capacity: 0,
            status: 'available',
            location: '',
            is_active: true,
            section_id: selectedSectionId,
            category_id: '',
            min_reservation_time: 60,
            max_reservation_time: 180,
            reservation_interval: 15
        });
    };

    return (
        <>
            {showAddTable && (
                <TableForm
                    formData={tableForm}
                    sections={sections}
                    categories={categories}
                    onSubmit={selectedTable ? handleEditTable : handleAddTable}
                    onCancel={() => {
                        setShowAddTable(false);
                        setSelectedTable(null);
                        setError(null);
                        resetTableForm();
                    }}
                    onChange={setTableForm}
                    title={selectedTable ? "Masa Düzenle" : "Yeni Masa Ekle"}
                    loading={formLoading}
                />
            )}
        </>
    );
}
