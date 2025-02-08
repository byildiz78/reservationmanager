export type LocationType = "salon" | "bahçe" | "teras";
export type ReservationType = "normal" | "özel" | "grup";
export type ServiceType = "standart" | "vip" | "özel";
export type ReservationStatus = "pending" | "awaiting_payment" | "payment_received" | "confirmed" | "customer_arrived" | "customer_no_show" | "customer_cancelled";

export interface Section {
  id?: number;
  section_id?: number;
  name?: string;
  section_name?: string;
  description?: string;
  section_description?: string;
}

export interface Table {
  id?: number;
  table_id?: number;
  name?: string;
  table_name?: string;
  capacity?: number;
  table_capacity?: number;
  status?: string;
  table_status?: string;
  section?: number;
  section_id?: number;
}

export interface FormData {
  customerName: string;
  phone: string;
  date: Date;
  time: string;
  persons: string;
  tableId: string;
  sectionId: string;
  type: 'normal' | 'vip';
  serviceType: 'standart' | 'special';
  notes: string;
  specialRequests: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'customer_no_show';
  isVip?: boolean;
  isSmoking?: boolean;
  isOutdoor?: boolean;
}
