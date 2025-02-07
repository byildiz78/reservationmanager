import React from 'react';
import { MapPin, Users } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Position {
    x: number;
    y: number;
}

interface Size {
    width: number;
    height: number;
}

interface TableData {
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

interface TableListProps {
    tables: TableData[];
    onEditTable: (table: TableData) => void;
}

const getStatusColor = (status: string) => {
    switch (status) {
        case 'available':
            return 'border-green-500 text-green-500';
        case 'reserved':
            return 'border-yellow-500 text-yellow-500';
        case 'occupied':
            return 'border-red-500 text-red-500';
        default:
            return 'border-gray-500 text-gray-500';
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
            return 'Bilinmiyor';
    }
};

export const TableList: React.FC<TableListProps> = ({ tables, onEditTable }) => {
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
                        <TableRow key={table.table_id} className="hover:bg-gray-50">
                            <TableCell className="font-medium">
                                {table.table_name}
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    <Users className="h-4 w-4" /> {table.capacity}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div>
                                    <div className="font-medium">
                                        {table.category_name}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                        {table.min_capacity}-{table.max_capacity} Kişilik
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-1 text-gray-600">
                                    {table.position ? (
                                        <>
                                            <MapPin className="h-4 w-4" />
                                            <span>{table.position.x}-{table.position.y}</span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(table.reservation_status)}`}>
                                    {getStatusText(table.reservation_status)}
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditTable(table)}
                                >
                                    Düzenle
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};
