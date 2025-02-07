import React from 'react';

interface TableCardProps {
    table: any;
    onEdit: () => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onEdit }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800';
            case 'occupied':
                return 'bg-red-100 text-red-800';
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return 'Müsait';
            case 'occupied':
                return 'Dolu';
            case 'reserved':
                return 'Rezerve';
            default:
                return 'Bilinmiyor';
        }
    };

    return (
        <div className="bg-white border rounded-lg p-4 relative">
            <button
                onClick={onEdit}
                className="absolute top-2 right-2 text-gray-400 hover:text-blue-600"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
            </button>
            <div className="mb-2">
                <h3 className="font-semibold">{table.name}</h3>
                <p className="text-sm text-gray-500">{table.location}</p>
            </div>
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{table.capacity} Kişilik</span>
                </div>
                {table.category && (
                    <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm">{table.category.name}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm">{table.minReservationTime}-{table.maxReservationTime} dk</span>
                </div>
            </div>
            <div className="mt-4">
                <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusColor(table.status)}`}>
                    {getStatusText(table.status)}
                </span>
            </div>
        </div>
    );
};
