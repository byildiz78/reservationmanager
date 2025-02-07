"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PencilIcon } from "lucide-react";
import { SectionForm } from './components/SectionForm';
import { TableForm } from './components/TableForm';
import { SectionList } from './components/SectionList';

// Types
interface Section {
    id: string;
    name: string;
    capacity: number;
    tables: Table[];
    image?: string;
    description?: string;
    isSmoking?: boolean;
    isOutdoor?: boolean;
    isVip?: boolean;
    orderNumber?: number;
}

interface Table {
    id: string;
    name: string;
    capacity: number;
    status: "active" | "inactive";
    reservationStatus: "available" | "reserved" | "occupied";
    location?: string;
    minReservationTime?: number;
    maxReservationTime?: number;
    reservationInterval?: number;
    category?: {
        id: string;
        name: string;
        minCapacity: number;
        maxCapacity: number;
    };
}

export default function TablesPage() {
    const [sections, setSections] = useState<Section[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [selectedTable, setSelectedTable] = useState<any>(null);
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
        is_vip: false,
        order_number: 0
    });

    const [tableForm, setTableForm] = useState({
        table_name: '',
        capacity: 0,
        section_id: '',
        category_id: '',
        status: 'available',
        location: '',
        min_reservation_time: 60,
        max_reservation_time: 180,
        reservation_interval: 15
    });

    const params = useParams();

    const fetchSections = async () => {
        try {
            const [sectionsResponse, categoriesResponse] = await Promise.all([
                fetch(`${params.tenantId}/api/postgres/list-sections`),
                fetch(`${params.tenantId}/api/postgres/table-categories`)
            ]);

            const sectionsData = await sectionsResponse.json();
            const categoriesData = await categoriesResponse.json();
            
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
                    is_vip: false,
                    order_number: 0
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
                    section_id: selectedSection.id
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
                    is_vip: false,
                    order_number: 0
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
                    location: '',
                    min_reservation_time: 60,
                    max_reservation_time: 180,
                    reservation_interval: 15
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
                    table_id: selectedTable.id
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
                    location: '',
                    min_reservation_time: 60,
                    max_reservation_time: 180,
                    reservation_interval: 15
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            ) : (
                <SectionList
                    sections={sections}
                    onEditSection={(section) => {
                        setSelectedSection(section);
                        setSectionForm({
                            section_name: section.name,
                            description: section.description || '',
                            capacity: section.capacity || 0,
                            is_smoking: section.isSmoking,
                            is_outdoor: section.isOutdoor,
                            is_vip: section.isVip,
                            order_number: section.orderNumber || 0
                        });
                        setShowEditSection(true);
                    }}
                    onAddTable={(sectionId) => {
                        setTableForm({
                            table_name: '',
                            capacity: 0,
                            section_id: sectionId,
                            category_id: '',
                            status: 'available',
                            location: '',
                            min_reservation_time: 60,
                            max_reservation_time: 180,
                            reservation_interval: 15
                        });
                        setShowAddTable(true);
                    }}
                    onEditTable={(table, sectionId) => {
                        setSelectedTable(table);
                        setTableForm({
                            table_name: table.name,
                            capacity: table.capacity,
                            section_id: sectionId,
                            category_id: table.category?.id || '',
                            status: table.reservationStatus,
                            location: table.location || '',
                            min_reservation_time: table.minReservationTime || 60,
                            max_reservation_time: table.maxReservationTime || 180,
                            reservation_interval: table.reservationInterval || 15
                        });
                        setShowEditTable(true);
                    }}
                />
            )}
        </div>
    );
}
