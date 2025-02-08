export type LocationType = "salon" | "bahçe" | "teras";
export type ReservationType = "normal" | "özel" | "grup";
export type ServiceType = "standart" | "vip" | "özel";
export type ReservationStatus = "pending" | "awaiting_payment" | "payment_received" | "confirmed" | "customer_arrived" | "customer_no_show" | "customer_cancelled";

export interface Section {
  section_id: number;
  section_name: string;
  description?: string;
  capacity?: number;
  is_smoking?: boolean;
  is_outdoor?: boolean;
  is_active?: boolean;
  tables?: Table[];
}

export interface Table {
  table_id: number;
  table_name: string;
  capacity?: number;
  status?: string;
  shape?: 'square' | 'circle' | 'rectangle';
  position?: { x: number; y: number };
  size?: { width: number; height: number };
  category_name?: string;
  min_capacity?: number;
  max_capacity?: number;
  reservation_status?: 'reserved' | 'occupied' | 'available';
}

export interface FormData {
  customerName: string;
  phone: string;
  date: Date;
  time: string;
  persons: string;
  tableId: string | null;
  tableName: string;
  sectionId: string | null;
  sectionName: string;
  type: 'normal' | 'vip';
  serviceType: 'standart' | 'special';
  notes: string;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'customer_no_show';
  isVip?: boolean;
  isSmoking?: boolean;
  isOutdoor?: boolean;
}
