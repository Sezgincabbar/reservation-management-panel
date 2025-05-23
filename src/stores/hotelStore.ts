import { defineStore } from 'pinia';
import { hotelService } from '../services/api';
import type { Hotel } from '../types';

export const useHotelStore = defineStore('hotel', {
  state: () => ({
    hotels: [] as Hotel[],
    loading: false,
    error: null as string | null,
  }),
  
  getters: {
    getHotelById: (state) => (id: string) => {
      return state.hotels.find(hotel => hotel.id === id);
    },
  },
  
  actions: {
    async fetchHotels() {
      this.loading = true;
      this.error = null;
      try {
        this.hotels = await hotelService.getAll();
      } catch (error) {
        this.error = 'Oteller yüklenirken bir hata oluştu';
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    async fetchHotel(id: string) {
      this.loading = true;
      this.error = null;
      try {
        const hotel = await hotelService.getById(id);
        const index = this.hotels.findIndex(h => h.id === id);
        if (index !== -1) {
          this.hotels[index] = hotel;
        } else {
          this.hotels.push(hotel);
        }
        return hotel;
      } catch (error) {
        this.error = 'Otel detayları yüklenirken bir hata oluştu';
        console.error(error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
  },
}); 