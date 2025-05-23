import axios from 'axios';
import type { Reservation, Hotel, Status } from '../types';

import { handleHttpError } from './httpErrorHandler';

const API_URL = 'https://682c1d4dd29df7a95be587f9.mockapi.io/api/v1';

const api = axios.create({
   baseURL: API_URL,
});

api.interceptors.response.use(
   (response) => response,
   (error) => {
      return handleHttpError(error);
   },
);

export interface ApiParams {
   page?: number;
   limit?: number;
   sortBy?: string;
   order?: 'asc' | 'desc';
   status?: number | string;
   hotel_id?: number | string;
   name?: string;
   name_like?: string;
   start_date_gte?: string;
   end_date_lte?: string;
   [key: string]: any;
}

const formatParams = (params?: ApiParams): Record<string, any> => {
   if (!params) return {};

   const result: Record<string, any> = {};

   if (params.page && params.limit) {
      const page = params.page;
      const limit = params.limit;

      result.page = page;
      result.limit = limit;
   }

   if (params.sortBy) {
      result.sortBy = params.sortBy;
      result.order = params.order || 'asc';
   }

   Object.keys(params).forEach((key) => {
      if (!['page', 'limit', 'sortBy', 'order'].includes(key)) {
         result[key] = params[key];
      }
   });

   return result;
};

export const reservationService = {
   getAll: async (params?: ApiParams): Promise<{ data: Reservation[]; totalCount: number }> => {
      console.log('API isteği gönderiliyor:', params);
      const formattedParams = formatParams(params);
      console.log('Formatlanmış parametreler:', formattedParams);

      try {
         const response = await api.get('/reservations', {
            params: formattedParams,
         });

         console.log('API yanıtı:', response.data);

         return {
            data: response.data,
            totalCount: response.data.length,
         };
      } catch (error) {
         console.error('Rezervasyon getirme hatası:', error);
         throw error;
      }
   },

   getById: async (id: string): Promise<Reservation> => {
      const response = await api.get(`/reservations/${id}`);
      return response.data;
   },

   create: async (reservation: Omit<Reservation, 'id' | 'createdAt'>): Promise<Reservation> => {
      const response = await api.post('/reservations', reservation);
      return response.data;
   },

   update: async (id: string, reservation: Partial<Reservation>): Promise<Reservation> => {
      const response = await api.put(`/reservations/${id}`, reservation);
      return response.data;
   },

   delete: async (id: string): Promise<void> => {
      await api.delete(`/reservations/${id}`);
   },
};

export const hotelService = {
   getAll: async (): Promise<Hotel[]> => {
      const response = await api.get('/hotels');
      return response.data;
   },

   getById: async (id: string): Promise<Hotel> => {
      const response = await api.get(`/hotels/${id}`);
      return response.data;
   },
};

export const statusService = {
   getAll: (): Status[] => {
      return [
         { title: 'APPROVED', id: '1' },
         { title: 'PENDING', id: '2' },
         { title: 'CANCELED', id: '3' },
      ];
   },

   getById: (id: string): Status | undefined => {
      const statuses = statusService.getAll();
      return statuses.find((status) => status.id === id);
   },

   getByTitle: (title: string): Status | undefined => {
      const statuses = statusService.getAll();
      return statuses.find((status) => status.title === title);
   },
};
