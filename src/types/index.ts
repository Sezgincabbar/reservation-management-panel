export interface Reservation {
   id: string;
   createdAt: string;
   name: string;
   surname: string;
   start_date: string;
   end_date: string;
   total_fee: string;
   status: number;
   hotel_id: number;
}

export interface Hotel {
   id: string;
   createdAt: string;
   name: string;
}

export interface Status {
   id: string;
   title: string;
}

export enum UserRole {
   ADMIN = 'admin',
   RECEPTIONIST = 'receptionist',
}

export interface User {
   id: string;
   name: string;
   role: UserRole;
   hotel_id?: number;
}
