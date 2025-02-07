"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { SectionForm } from './components/SectionForm';
import { TableForm } from './components/TableForm';
import { SectionList } from './components/SectionList';
import api from '@/lib/axios';

// Types
interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface Table {
    table_id: number;
    table_name: string;
    capacity: number;
    status: "available" | "reserved" | "occupied";
    shape: "rectangle" | "circle";
    position: Position;
    size: Size;
    category_name: string;
    min_capacity: number;
    max_capacity: number;
    reservation_status: "available" | "reserved" | "occupied";
}

interface Section {
    section_id: number;
    section_name: string;
    description: string;
    capacity: number | null;
    is_smoking: boolean;
    is_outdoor: boolean;
    is_active: boolean;
    tables: Table[];
}

export default function TablesPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [formLoading, setFormLoading] = useState(false);

    // Modal states
    const [showAddSection, setShowAddSection] = useState(false);
    const [showEditSection, setShowEditSection] = useState(false);
    const [showAddTable, setShowAddTable] = useState(false);
    const [showEditTable, setShowEditTable] = useState(false);

    // Form states
    const [sectionForm, setSectionForm] = useState({
        section_name: '',
        description: '',
        capacity: 0,
        is_smoking: false,
        is_outdoor: false,
        is_active: false
    });

    const [tableForm, setTableForm] = useState({
        table_name: '',
        capacity: 0,
        section_id: '',
        category_id: '',
        status: 'available',
        position: { x: 0, y: 0 },
        size: { width: 0, height: 0 },
        shape: 'rectangle',
        min_capacity: 0,
        max_capacity: 0,
        reservation_status: 'available'
    });

    const params = useParams();

    const fetchSections = async () => {
        try {
            const [sectionsResponse, categoriesResponse] = await Promise.all([
                api.get(`/api/postgres/list-sections`),
                api.get(`/api/postgres/table-categories`)
            ]);

            const sectionsData = await sectionsResponse.data;
            const categoriesData = await categoriesResponse.data;
            
            if (sectionsData.success) {
                setSections(sectionsData.data);
            } else {
                setError(sectionsData.error || 'Bölümler yüklenirken bir hata oluştu');
            }
            
            if (categoriesData.success) {
                setCategories(categoriesData.data);
            } else {
                setError(categoriesData.error || 'Kategoriler yüklenirken bir hata oluştu');
            }
        } catch (error) {
            setError('Veriler yüklenirken bir hata oluştu');
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, [params.tenantId]);

    const handleAddSection = async () => {
        try {
            setFormLoading(true);
            setError(null);

            const response = await fetch('/franchisemanager/api/postgres/add-section', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sectionForm),
            });

            const data = await response.json();
            
            if (data.success) {
                await fetchSections();
                setShowAddSection(false);
                setSectionForm({
                    section_name: '',
                    description: '',
                    capacity: 0,
                    is_smoking: false,
                    is_outdoor: false,
                    is_active: false
                });
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

            const response = await fetch('/franchisemanager/api/postgres/update-section', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...sectionForm,
                    section_id: selectedSection.section_id
                }),
            });

            const data = await response.json();
            
            if (data.success) {
                await fetchSections();
                setShowEditSection(false);
                setSelectedSection(null);
                setSectionForm({
                    section_name: '',
                    description: '',
                    capacity: 0,
                    is_smoking: false,
                    is_outdoor: false,
                    is_active: false
                });
            } else {
                throw new Error(data.error || 'Bölüm güncellenirken bir hata oluştu');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Bölüm güncellenirken bir hata oluştu');
            console.error('Update Section Error:', error);
        } finally {
            setFormLoading(false);
        }
    };

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

            const response = await fetch('/franchisemanager/api/postgres/add-table', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(tableForm),
            });

            const data = await response.json();
            
            if (data.success) {
                await fetchSections();
                setShowAddTable(false);
                setTableForm({
                    table_name: '',
                    capacity: 0,
                    section_id: '',
                    category_id: '',
                    status: 'available',
                    position: { x: 0, y: 0 },
                    size: { width: 0, height: 0 },
                    shape: 'rectangle',
                    min_capacity: 0,
                    max_capacity: 0,
                    reservation_status: 'available'
                });
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
            if (!tableForm.category_id) {
                throw new Error('Lütfen bir kategori seçin');
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
                await fetchSections();
                setShowEditTable(false);
                setSelectedTable(null);
                setTableForm({
                    table_name: '',
                    capacity: 0,
                    section_id: '',
                    category_id: '',
                    status: 'available',
                    position: { x: 0, y: 0 },
                    size: { width: 0, height: 0 },
                    shape: 'rectangle',
                    min_capacity: 0,
                    max_capacity: 0,
                    reservation_status: 'available'
                });
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

    const handleEditTableModal = (table: Table, sectionId: number) => {
        setSelectedTable(table);
        setTableForm({
            table_name: table.table_name,
            capacity: table.capacity,
            section_id: sectionId.toString(),
            category_id: table.category_name,
            status: table.status,
            position: table.position,
            size: table.size,
            shape: table.shape,
            min_capacity: table.min_capacity,
            max_capacity: table.max_capacity,
            reservation_status: table.reservation_status
        });
        setShowEditTable(true);
    };

    return (
        <div className="container mx-auto px-4 py-6 pb-24 h-screen overflow-auto">
            {error && (
                <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
                    <span className="block sm:inline">{error}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                            <title>Kapat</title>
                            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                        </svg>
                    </span>
                </div>
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Masa Yönetimi</h1>
                <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setShowAddSection(true)}
                >
                    Yeni Bölüm Ekle
                </button>
            </div>

            {/* Add Section Modal */}
            {showAddSection && (
                <SectionForm
                    formData={sectionForm}
                    onSubmit={handleAddSection}
                    onCancel={() => {
                        setShowAddSection(false);
                        setError(null);
                    }}
                    onChange={setSectionForm}
                    title="Yeni Bölüm Ekle"
                    loading={formLoading}
                />
            )}

            {/* Edit Section Modal */}
            {showEditSection && selectedSection && (
                <SectionForm
                    formData={sectionForm}
                    onSubmit={handleEditSection}
                    onCancel={() => {
                        setShowEditSection(false);
                        setSelectedSection(null);
                        setError(null);
                    }}
                    onChange={setSectionForm}
                    title="Bölüm Düzenle"
                    loading={formLoading}
                />
            )}

            {/* Add Table Modal */}
            {showAddTable && (
                <TableForm
                    formData={tableForm}
                    sections={sections}
                    categories={categories}
                    onSubmit={handleAddTable}
                    onCancel={() => {
                        setShowAddTable(false);
                        setError(null);
                    }}
                    onChange={setTableForm}
                    title="Yeni Masa Ekle"
                    loading={formLoading}
                />
            )}

            {/* Edit Table Modal */}
            {showEditTable && selectedTable && (
                <TableForm
                    formData={tableForm}
                    sections={sections}
                    categories={categories}
                    onSubmit={handleEditTable}
                    onCancel={() => {
                        setShowEditTable(false);
                        setSelectedTable(null);
                        setError(null);
                    }}
                    onChange={setTableForm}
                    title="Masa Düzenle"
                    loading={formLoading}
                />
            )}

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            ) : (
                <SectionList
                    sections={sections}
                    onEditSection={(section) => {
                        setSelectedSection(section);
                        setSectionForm({
                            section_name: section.section_name,
                            description: section.description || '',
                            capacity: section.capacity || 0,
                            is_smoking: section.is_smoking,
                            is_outdoor: section.is_outdoor,
                            is_active: section.is_active
                        });
                        setShowEditSection(true);
                    }}
                    onAddTable={(sectionId) => {
                        setTableForm(prev => ({ ...prev, section_id: sectionId.toString() }));
                        setShowAddTable(true);
                    }}
                    onEditTable={handleEditTableModal}
                />
            )}
        </div>
    );
}
