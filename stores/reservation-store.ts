import { create } from 'zustand';
import api from '@/lib/axios';

// PostgreSQL types
export interface Reservation {
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
  is_vip: boolean;
  table: {
    table_id: number;
    table_name: string;
    table_capacity: number;
    table_status: string;
  };
  section: {
    id: number;
    name: string;
    description: string;
  };
}

export interface Table {
  table_id: number;
  table_name: string;
  table_capacity: number;
  table_status: string;
  section_id: number;
  section_name: string;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean;
}

export interface Section {
  section_id: number;
  section_name: string;
  description: string;
  is_smoking: boolean;
  is_outdoor: boolean;
  is_vip: boolean;
}

interface ReservationStore {
  tenantId: string | null;
  reservations: Reservation[];
  tables: Table[];
  sections: Section[];
  selectedDate: Date;
  isLoading: boolean;
  error: string | null;
  setSelectedDate: (date: Date) => void;
  fetchReservations: () => Promise<void>;
  fetchSections: () => Promise<void>;
  fetchTables: () => Promise<void>;
  fetchInitialData: () => Promise<void>;
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<void>;
  updateReservation: (id: number, updates: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  tenantId: null,
  reservations: [],
  tables: [],
  sections: [],
  selectedDate: new Date(),
  isLoading: false,
  error: null,
  setSelectedDate: (date: Date) => set({ selectedDate: date }),
  
  fetchReservations: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/postgres/reservations`);
      if (response.data.success) {
        set({ reservations: response.data.data });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Rezervasyonlar yüklenirken bir hata oluştu'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSections: async () => {
    try {
      const response = await api.get(`/api/postgres/list-sections`);
      if (response.data.success) {
        set({ sections: response.data.data });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Bölümler yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Bölümler yüklenirken bir hata oluştu'
      });
    }
  },

  fetchTables: async () => {
    try {
      const response = await api.get(`/api/postgres/list-tables`);
      if (response.data.success) {
        set({ tables: response.data.data });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Masalar yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Masalar yüklenirken bir hata oluştu'
      });
    }
  },

  fetchInitialData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [reservationsRes, tablesRes, sectionsRes] = await Promise.all([
        api.get(`/api/postgres/reservations`),
        api.get(`/api/postgres/list-tables`),
        api.get(`/api/postgres/list-sections`)
      ]);

      if (reservationsRes.data.success && tablesRes.data.success && sectionsRes.data.success) {
        set({
          reservations: reservationsRes.data.data,
          tables: tablesRes.data.data,
          sections: sectionsRes.data.data,
          error: null
        });
      }
    } catch (error) {
      console.error('Veriler yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Veriler yüklenirken bir hata oluştu'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  addReservation: async (reservation) => {
    const { tenantId } = get();
    if (!tenantId) {
      set({ error: 'Tenant ID bulunamadı' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/reservations', { ...reservation, tenantId });
      if (response.data.success) {
        const newReservation = response.data.data;
        set(state => ({
          reservations: [...state.reservations, newReservation],
          isLoading: false
        }));
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Rezervasyon eklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Rezervasyon eklenirken bir hata oluştu',
        isLoading: false 
      });
      throw error;
    }
  },

  updateReservation: async (id, updates) => {
    const { tenantId } = get();
    if (!tenantId) {
      set({ error: 'Tenant ID bulunamadı' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.put('/reservations', { id, ...updates, tenantId });
      if (response.data.success) {
        const updatedReservation = response.data.data;
        set(state => ({
          reservations: state.reservations.map(r => 
            r.id === id ? { ...r, ...updatedReservation } : r
          ),
          isLoading: false
        }));
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Rezervasyon güncellenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Rezervasyon güncellenirken bir hata oluştu',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteReservation: async (id) => {
    const { tenantId } = get();
    if (!tenantId) {
      set({ error: 'Tenant ID bulunamadı' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const response = await api.delete('/reservations', { data: { id, tenantId } });
      if (response.data.success) {
        set(state => ({
          reservations: state.reservations.filter(r => r.id !== id),
          isLoading: false
        }));
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Rezervasyon silinirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Rezervasyon silinirken bir hata oluştu',
        isLoading: false 
      });
      throw error;
    }
  }
}));
