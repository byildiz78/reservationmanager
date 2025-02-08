"use client";

import { useState } from "react";
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

    const handleEditTable = (table: Table, sectionId: number) => {
        setSelectedTable(table);
        setSelectedSectionId(sectionId.toString());
        setShowAddTable(true);
    };

    const handleAddTable = (sectionId: number) => {
        setSelectedSectionId(sectionId.toString());
        setShowAddTable(true);
    };

    return (
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

            <SectionManager 
                onSectionUpdate={fetchSections}
                showAddSection={showAddSection}
                setShowAddSection={setShowAddSection}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
            />
            
            <TableManager 
                sections={sections}
                categories={categories}
                onTableUpdate={fetchSections}
                showAddTable={showAddTable}
                setShowAddTable={setShowAddTable}
                selectedTable={selectedTable}
                setSelectedTable={setSelectedTable}
                selectedSectionId={selectedSectionId}
            />

            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
                </div>
            ) : (
                <SectionList
                    sections={sections}
                    onEditSection={handleEditSection}
                    onAddTable={handleAddTable}
                    onEditTable={handleEditTable}
                />
            )}
        </div>
    );
}
