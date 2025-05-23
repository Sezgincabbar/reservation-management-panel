import { defineStore } from 'pinia';
import { UserRole } from '../types';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', {
   state: () => ({
      currentUser: null as User | null,
      isAuthenticated: false,
      loading: false,
      error: null as string | null,
   }),

   getters: {
      isAdmin: (state) => state.currentUser?.role === UserRole.ADMIN,
      isReceptionist: (state) => state.currentUser?.role === UserRole.RECEPTIONIST,
      userHotelId: (state) => state.currentUser?.hotel_id,
      canManageAllHotels: (state) => state.currentUser?.role === UserRole.ADMIN,
      canManageReservations: () => true,
      canCreateReservation: (state) => state.currentUser?.role === UserRole.ADMIN,
      canUpdateReservation: () => true,
      canDeleteReservation: (state) => state.currentUser?.role === UserRole.ADMIN,
      canUpdateReservationStatus: () => true,

      canManageHotelReservations: (state) => (hotelId: number) => {
         if (state.currentUser?.role === UserRole.ADMIN) return true;
         if (state.currentUser?.role === UserRole.RECEPTIONIST) {
            return state.currentUser.hotel_id === hotelId;
         }
         return false;
      },
   },

   actions: {
      async login(email: string, password: string) {
         this.loading = true;
         this.error = null;

         try {
            // Demo kullanıcıları (gerçek bir API çağrısı yerine)
            const users = [
               { id: '1', name: 'Admin User', role: UserRole.ADMIN, email: 'admin@example.com', password: 'admin123' },
               { id: '2', name: 'Hotel Receptionist', role: UserRole.RECEPTIONIST, hotel_id: 1, email: 'recep@example.com', password: 'recep123' },
               { id: '3', name: 'Hotel Receptionist 2', role: UserRole.RECEPTIONIST, hotel_id: 2, email: 'recep2@example.com', password: 'recep123' },
            ];

            const user = users.find((u) => u.email === email && u.password === password);

            if (user) {
               // Kullanıcı bilgilerini sakla (şifre hariç)
               const { password: _, email: __, ...userWithoutSensitiveInfo } = user;
               this.currentUser = userWithoutSensitiveInfo as User;
               this.isAuthenticated = true;

               // Kullanıcı bilgilerini localStorage'a kaydet
               localStorage.setItem('user', JSON.stringify(this.currentUser));
               localStorage.setItem('isAuthenticated', 'true');

               return true;
            } else {
               this.error = 'Geçersiz e-posta veya şifre';
               return false;
            }
         } catch (error) {
            this.error = 'Giriş yapılırken bir hata oluştu';
            console.error(error);
            return false;
         } finally {
            this.loading = false;
         }
      },

      logout() {
         this.currentUser = null;
         this.isAuthenticated = false;

         // localStorage'dan kullanıcı bilgilerini temizle
         localStorage.removeItem('user');
         localStorage.removeItem('isAuthenticated');
      },

      // Sayfa yenilendiğinde kullanıcı oturumunu kontrol et
      checkAuth() {
         const storedUser = localStorage.getItem('user');
         const storedAuth = localStorage.getItem('isAuthenticated');

         if (storedUser && storedAuth === 'true') {
            try {
               this.currentUser = JSON.parse(storedUser);
               this.isAuthenticated = true;
            } catch (error) {
               console.error('Kullanıcı bilgileri çözümlenirken hata oluştu:', error);
               this.logout(); // Hata durumunda oturumu kapat
            }
         }
      },
   },
});
