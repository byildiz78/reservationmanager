import { useState, useEffect } from 'react';
import api from '@/lib/axios';

interface Table {
  table_id: number;
  table_name: string;
  section_name: string;
  table_capacity: number;
  table_status: string;
  section_description?: string;
}

interface Reservation {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  party_size: number;
  reservation_date: string;
  reservation_time: string;
  status: string;
  notes: string;
  specialnotes: string;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean | null;
  table: {
    table_id: number;
    table_name: string;
    table_capacity?: number;
    table_status?: string;
  };
  section: {
    id: number;
    name: string;
    description?: string;
  };
}

export function useReservation(reservationId: number) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservation = async (reservationId: string) => {
    setLoading(true);
    try {
      // First fetch tables to get section info
      const tablesResponse = await api.get('/api/postgres/list-tables');
      const tables = tablesResponse.data.data || [];

      // Then fetch reservation
      const reservationResponse = await api.get(`/api/postgres/get-reservation?reservationId=${reservationId}`);
      
      if (!reservationResponse.data) {
        throw new Error('No reservation data received');
      }

      // Find the table and its section
      const reservationData = reservationResponse.data;
      const tableId = reservationData.table_id;
      const matchingTable = tables.find(t => t.table_id === Number(tableId));

      // Ensure we have valid table and section data
      const processedData = {
        ...reservationData,
        table: matchingTable ? {
          table_id: matchingTable.table_id,
          table_name: matchingTable.table_name,
          table_capacity: matchingTable.table_capacity,
          table_status: matchingTable.table_status
        } : null,
        section: matchingTable ? {
          id: matchingTable.section_id,
          name: matchingTable.section_name || '',
          description: ''
        } : null
      };

      setReservation(processedData);
      setLoading(false);
      return processedData;
    } catch (error) {
      setError(error);
      setLoading(false);
      throw error;
    }
  };

  useEffect(() => {
    if (reservationId) {
      fetchReservation(String(reservationId));
    }
  }, [reservationId]);

  return { reservation, tables, loading, error };
}
