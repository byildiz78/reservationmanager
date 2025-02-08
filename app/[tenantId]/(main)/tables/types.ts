export interface Position {
    x: number;
    y: number;
}

export interface Size {
    width: number;
    height: number;
}

export interface Table {
    table_id: number;
    branch_id: number;
    table_name: string;
    capacity: number;
    status: "available" | "reserved" | "occupied";
    location?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
    section_id?: number;
    category_id?: number;
    min_reservation_time?: number;
    max_reservation_time?: number;
    reservation_interval?: number;
}

export interface Section {
    section_id: number;
    branch_id: number;
    section_name: string;
    description?: string;
    capacity?: number;
    is_smoking: boolean;
    is_outdoor: boolean;
    is_vip: boolean;
    is_active: boolean;
    order_number?: number;
    created_at?: string;
    updated_at?: string;
    tables?: Table[];
}

export interface Category {
    category_id: number;
    category_name: string;
    min_capacity?: number;
    max_capacity?: number;
}

export interface SectionFormData {
    section_name: string;
    description: string;
    capacity?: number;
    is_smoking: boolean;
    is_outdoor: boolean;
    is_vip: boolean;
    is_active: boolean;
    order_number?: number;
}

export interface TableFormData {
    table_name: string;
    capacity: number;
    status: "available" | "reserved" | "occupied";
    location: string;
    is_active: boolean;
    section_id: number;
    category_id: number;
    min_reservation_time: number;
    max_reservation_time: number;
    reservation_interval: number;
}
