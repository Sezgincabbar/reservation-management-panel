import { defineStore } from 'pinia';
import { reservationService, type ApiParams } from '../services/api';
import type { Reservation } from '../types';

export const useReservationStore = defineStore('reservation', {
  state: () => ({
    reservations: [] as Reservation[],
    currentReservation: null as Reservation | null,
    loading: false,
    error: null as string | null,
    totalCount: 0, // Toplam rezervasyon sayısı için
  }),
  
  getters: {
    getReservationById: (state) => (id: string) => {
      return state.reservations.find(reservation => reservation.id === id);
    },
  },
  
  actions: {
    async fetchReservations(params?: ApiParams) {
      this.loading = true;
      this.error = null;
      try {
        const response = await reservationService.getAll(params);
        this.reservations = response.data;
        this.totalCount = response.totalCount;
      } catch (error) {
        this.error = 'Rezervasyonlar yüklenirken bir hata oluştu';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchReservation(id: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentReservation = await reservationService.getById(id);
      } catch (error) {
        this.error = 'Rezervasyon detayları yüklenirken bir hata oluştu';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async createReservation(reservation: Omit<Reservation, 'id' | 'createdAt'>) {
      this.loading = true;
      this.error = null;
      try {
        const newReservation = await reservationService.create(reservation);
        this.reservations.push(newReservation);
        return newReservation;
      } catch (error) {
        this.error = 'Rezervasyon oluşturulurken bir hata oluştu';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateReservation(id: string, reservation: Partial<Reservation>) {
      this.loading = true;
      this.error = null;
      try {
        const updatedReservation = await reservationService.update(id, reservation);
        const index = this.reservations.findIndex(r => r.id === id);
        if (index !== -1) {
          this.reservations[index] = updatedReservation;
        }
        return updatedReservation;
      } catch (error) {
        this.error = 'Rezervasyon güncellenirken bir hata oluştu';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteReservation(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await reservationService.delete(id);
        this.reservations = this.reservations.filter(r => r.id !== id);
      } catch (error) {
        this.error = 'Rezervasyon silinirken bir hata oluştu';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
}); 