import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Table {
    table_id: number;
    table_name: string;
    table_capacity: number;
    table_status: string;
    section_id: number;
    section_name: string;
    section_description: string | null;
    is_smoking: boolean;
    is_outdoor: boolean;
    is_vip: boolean;
}

export function useReservation(reservationId: number) {
    const [reservation, setReservation] = useState<any>(null);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTables = async () => {
        try {
            const response = await api.get('/api/postgres/list-tables');
            if (response.data.success) {
                setTables(response.data.data);
            }
        } catch (err) {
            console.error('Error fetching tables:', err);
        }
    };

    const fetchReservation = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.get(`/api/postgres/get-reservation?reservationId=${reservationId}`);
            console.log('API Response:', response.data);
            
            if (!response.data) {
                throw new Error('No data received from API');
            }

            // API returns the data directly
            const reservationData = response.data;
            console.log('Processed reservation data:', reservationData);
            
            setReservation(reservationData);
        } catch (err) {
            console.error('Error fetching reservation:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch reservation');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (reservationId) {
            fetchReservation();
            fetchTables();
        }
    }, [reservationId]);

    const refetch = () => {
        return fetchReservation();
    };

    return { reservation, tables, loading, error, refetch };
}
