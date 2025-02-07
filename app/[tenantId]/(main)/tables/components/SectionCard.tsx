import React from 'react';
import { TableCard } from './TableCard';

interface SectionCardProps {
    section: any;
    onEditSection: (section: any) => void;
    onEditTable: (table: any) => void;
    onAddTable: () => void;
}

export const SectionCard: React.FC<SectionCardProps> = ({
    section,
    onEditSection,
    onEditTable,
    onAddTable
}) => {
    return (
        <div className="bg-white rounded-lg shadow-sm mb-4">
            <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">{section.name}</h2>
                    <p className="text-gray-600 text-sm">{section.description}</p>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => onEditSection(section)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                    </button>
                    <div className="flex gap-2">
                        {section.isSmoking && (
                            <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                Sigara İçilebilir
                            </span>
                        )}
                        {section.isOutdoor && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                Açık Alan
                            </span>
                        )}
                        {section.isVip && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                                VIP
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {section.tables?.map((table: any) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onEdit={() => onEditTable(table)}
                        />
                    ))}
                    <button
                        onClick={onAddTable}
                        className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="mt-2 text-sm text-gray-500">Yeni Masa Ekle</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
