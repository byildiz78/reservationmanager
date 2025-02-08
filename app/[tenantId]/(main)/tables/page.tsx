"use client";

import { useState, Suspense } from "react";
import { useSections } from './hooks/useSections';
import { ErrorDisplay } from './components/ErrorDisplay';
import { SectionManager } from './components/SectionManager';
import { TableManager } from './components/TableManager';
import { SectionList } from './components/SectionList';
import { Section, Table } from './types';

export default function TablesPage() {
    const { sections, categories, loading, error, setError, fetchSections } = useSections();
    const [showAddSection, setShowAddSection] = useState(false);
    const [showAddTable, setShowAddTable] = useState(false);
    const [selectedSection, setSelectedSection] = useState<Section | null>(null);
    const [selectedTable, setSelectedTable] = useState<Table | null>(null);
    const [selectedSectionId, setSelectedSectionId] = useState<string>('');

    const handleEditSection = (section: Section) => {
        setSelectedSection(section);
        setShowAddSection(true);
    };

    const handleEditTable = (table: Table, section: Section) => {
        setSelectedTable(table);
        setSelectedSection(section);
        setShowAddTable(true);
    };

    const handleAddTable = (section: Section) => {
        setSelectedSection(section);
        setShowAddTable(true);
    };

    return (
        <Suspense fallback={
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
                <span className="ml-3 text-lg text-gray-600">Yükleniyor...</span>
            </div>
        }>
            <div className="container mx-auto px-4 py-6 pb-24 h-screen overflow-auto">
                <ErrorDisplay error={error} onClose={() => setError(null)} />

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Masa Yönetimi</h1>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => {
                            setSelectedSection(null);
                            setShowAddSection(true);
                        }}
                    >
                        Yeni Bölüm Ekle
                    </button>
                </div>

                {sections.length === 0 && !loading ? (
                    <div className="text-center text-gray-600 mt-8">
                        Henüz hiç bölüm eklenmemiş
                    </div>
                ) : (
                    <SectionList
                        sections={sections}
                        onEditSection={handleEditSection}
                        onEditTable={handleEditTable}
                        onAddTable={handleAddTable}
                    />
                )}

                {showAddSection && (
                    <SectionManager
                        onSectionUpdate={fetchSections}
                        showAddSection={showAddSection}
                        setShowAddSection={setShowAddSection}
                        selectedSection={selectedSection}
                        setSelectedSection={setSelectedSection}
                    />
                )}

                {showAddTable && selectedSection && (
                    <TableManager
                        sections={sections}
                        categories={categories}
                        onTableUpdate={fetchSections}
                        showAddTable={showAddTable}
                        setShowAddTable={setShowAddTable}
                        selectedTable={selectedTable}
                        setSelectedTable={setSelectedTable}
                        selectedSection={selectedSection}
                    />
                )}
            </div>
        </Suspense>
    );
}
