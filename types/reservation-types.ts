export type Table = {
  id: number;
  name: string;
  capacity: number;
  status: 'available' | 'reserved' | 'occupied';
  location?: string;
};

export type LocationType = 'salon' | 'terrace' | 'upstairs';
export type ReservationType = 'normal' | 'dogumgunu' | 'yildonumu' | 'toplanti' | 'ozel';
export type ServiceType = 'alacarte' | 'fixmenu' | 'standart' | 'ozel';

export type Reservation = {
  id: number;
  customerName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  tableId: number;
  persons: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  type: ReservationType;
  location: LocationType;
  serviceType: ServiceType;
  notes?: string;
  specialRequests?: string;
};
