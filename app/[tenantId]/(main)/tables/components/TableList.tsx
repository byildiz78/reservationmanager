import React from 'react';
import { PencilIcon, Users, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface TableListProps {
    tables: any[];
    onEditTable: (table: any) => void;
}

export const TableList: React.FC<TableListProps> = ({ tables, onEditTable }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'available':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'reserved':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'occupied':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return 'Müsait';
            case 'reserved':
                return 'Rezerve';
            case 'occupied':
                return 'Dolu';
            default:
                return status;
        }
    };

    return (
        <div className="p-4">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Masa No</TableHead>
                        <TableHead>Kapasite</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Konum</TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tables.map((table) => (
                        <TableRow key={table.id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                                {table.name}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="h-4 w-4" />
                                    <span>{table.capacity} Kişilik</span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {table.category && (
                                    <div>
                                        <div className="font-medium">
                                            {table.category.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {table.category.minCapacity}-{table.category.maxCapacity} Kişilik
                                        </div>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    {table.location ? (
                                        <>
                                            <MapPin className="h-4 w-4" />
                                            <span>{table.location}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.reservationStatus)}`}>
                                    {getStatusText(table.reservationStatus)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEditTable(table)}
                                >
                                    <PencilIcon className="h-4 w-4" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
