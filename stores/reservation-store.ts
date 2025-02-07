import { create } from 'zustand';
import api from '@/lib/axios';

// PostgreSQL types
export interface Reservation {
  id: number;
  customerName: string;
  customerPhone: string;
  guestCount: number;
  reservationDate: string;
  reservationTime: string;
  tableId: number;
  tableName: string;
  sectionId: number;
  sectionName: string;
  status: string;
  specialnotes?: string;
}

export interface Table {
  table_id: string;
  table_name: string;
  section_id: string;
  capacity: number;
  status: string;
}

export interface Section {
  id: number;
  name: string;
  description?: string;
  capacity?: number;
  isSmoking: boolean;
  isOutdoor: boolean;
  isActive: boolean;
  tables?: any[];
}

interface ReservationStore {
  tenantId: string | null;
  reservations: Reservation[];
  tables: Table[];
  sections: Section[];
  isLoading: boolean;
  error: string | null;
  fetchReservations: () => Promise<void>;
  fetchSections: () => Promise<void>;
  addReservation: (reservation: Omit<Reservation, 'id'>) => Promise<void>;
  updateReservation: (id: number, updates: Partial<Reservation>) => Promise<void>;
  deleteReservation: (id: number) => Promise<void>;
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  tenantId: null,
  reservations: [],
  tables: [],
  sections: [],
  isLoading: false,
  error: null,
  fetchSections: async () => {
    try {
      const response = await api.get(`/api/postgres/list-sections`);
      console.log('Sections Response:', response.data);
      if (response.data.success) {
        set({ sections: response.data.data });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Bölümler yüklenirken hata:', error);
      set({ error: error instanceof Error ? error.message : 'Bölümler yüklenirken bir hata oluştu' });
    }
  },

  fetchReservations: async () => {

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/api/postgres/reservations`);
      console.log('API Response:', response.data);
      if (response.data.success) {
        set({ reservations: response.data.data, isLoading: false });
      } else {
        throw new Error(response.data.error);
      }
    } catch (error) {
      console.error('Rezervasyonlar yüklenirken hata:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Rezervasyonlar yüklenirken bir hata oluştu',
        isLoading: false 
      });
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
