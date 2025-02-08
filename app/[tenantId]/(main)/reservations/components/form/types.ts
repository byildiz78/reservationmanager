export type LocationType = "salon" | "bahçe" | "teras";
export type ReservationType = "normal" | "özel" | "grup";
export type ServiceType = "standart" | "vip" | "özel";
export type ReservationStatus = "pending" | "awaiting_payment" | "payment_received" | "confirmed" | "customer_arrived" | "customer_no_show" | "customer_cancelled";

export interface Section {
  section_id: number;
  section_name: string;
  section_description: string | null;
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

export interface FormData {
  customerName: string;
  phone: string;
  date: Date;
  time: string;
  persons: string;
  tableId: string;
  sectionId: string;
  type: string;
  serviceType: string;
  notes: string;
  specialRequests: string;
  status: string;
}
