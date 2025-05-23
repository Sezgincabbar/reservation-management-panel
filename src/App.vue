<script setup lang="ts">
import { computed } from 'vue';
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';
//@ts-ignore
import { useI18n } from 'vue-i18n';
import LoadingOverlay from './components/LoadingOverlay.vue';
import ErrorBoundary from './components/ErrorBoundary.vue';
import { useReservationStore } from './stores/reservationStore';
import { useHotelStore } from './stores/hotelStore';
import { useAuthStore } from './stores/authStore';

const reservationStore = useReservationStore();
const hotelStore = useHotelStore();
const authStore = useAuthStore();
const router = useRouter();
const { t, locale } = useI18n();

// Mevcut dil seçenekleri
const locales = [
   { code: 'tr', name: 'Türkçe' },
   { code: 'en', name: 'English' },
];

// Dil değiştirme fonksiyonu
const changeLocale = (lang: string) => {
   locale.value = lang;
   localStorage.setItem('locale', lang);
};

// Sayfa yüklendiğinde localStorage'dan dil ayarını al
if (typeof window !== 'undefined') {
   const savedLocale = localStorage.getItem('locale');
   if (savedLocale) {
      locale.value = savedLocale;
   }
}

// Global loading state
const isLoading = computed(() => {
   return reservationStore.loading || hotelStore.loading || authStore.loading;
});

// Kullanıcı giriş yapmış mı?
const isAuthenticated = computed(() => authStore.isAuthenticated);

const currentUser = computed(() => authStore.currentUser);

const isAdmin = computed(() => authStore.isAdmin);

const logout = () => {
   authStore.logout();
   router.push('/login');
   toast.info(t('menu.logoutSuccess'));
};

// Toast instance
const toast = useToast();

declare global {
   interface Window {
      toast: any;
   }
}

if (typeof window !== 'undefined') {
   window.toast = toast;
}
</script>

<template>
   <v-app>
      <v-app-bar color="primary" dense flat app>
         <v-app-bar-title class="d-none d-sm-flex">{{ t('app.title') }}</v-app-bar-title>
         <v-app-bar-title class="d-flex d-sm-none text-center w-100">{{ t('app.title') }}</v-app-bar-title>
         <v-spacer class="d-none d-sm-flex"></v-spacer>

         <v-menu class="d-flex" offset-y left v-if="$vuetify.display.xs">
            <template v-slot:activator="{ props }">
               <v-btn icon v-bind="props">
                  <v-icon>mdi-menu</v-icon>
               </v-btn>
            </template>
            <v-list>
               <v-list-item v-if="isAuthenticated" to="/">
                  <v-list-item-title>{{ t('menu.home') }}</v-list-item-title>
               </v-list-item>
               <v-list-item v-if="isAuthenticated" to="/reservations">
                  <v-list-item-title>{{ t('menu.reservations') }}</v-list-item-title>
               </v-list-item>
               <v-list-item v-if="isAdmin && isAuthenticated" to="/hotels">
                  <v-list-item-title>{{ t('menu.hotels') }}</v-list-item-title>
               </v-list-item>
               <v-list-item>
                  <v-list-item-title>
                     <v-menu>
                        <template v-slot:activator="{ props }">
                           <v-btn v-bind="props" variant="text">
                              {{ locale === 'tr' ? t('language.tr') : t('language.en') }}
                              <v-icon right>mdi-translate</v-icon>
                           </v-btn>
                        </template>
                        <v-list>
                           <v-list-item v-for="lang in locales" :key="lang.code" @click="changeLocale(lang.code)" :active="locale === lang.code">
                              <v-list-item-title>{{ lang.name }}</v-list-item-title>
                           </v-list-item>
                        </v-list>
                     </v-menu>
                  </v-list-item-title>
               </v-list-item>
               <v-list-item v-if="isAuthenticated" @click="logout">
                  <v-list-item-title>
                     <v-icon left>mdi-logout</v-icon>
                     {{ t('menu.logout') }}
                  </v-list-item-title>
               </v-list-item>
            </v-list>
         </v-menu>

         <template v-if="isAuthenticated">
            <v-btn to="/" variant="text" class="d-none d-sm-flex">{{ t('menu.home') }}</v-btn>
            <v-btn to="/reservations" variant="text" class="d-none d-sm-flex">{{ t('menu.reservations') }}</v-btn>
            <v-btn v-if="isAdmin" to="/hotels" variant="text" class="d-none d-sm-flex">{{ t('menu.hotels') }}</v-btn>
            <v-menu class="d-none d-sm-flex">
               <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="text">
                     {{ locale === 'tr' ? t('language.tr') : t('language.en') }}
                     <v-icon right>mdi-translate</v-icon>
                  </v-btn>
               </template>
               <v-list>
                  <v-list-item v-for="lang in locales" :key="lang.code" @click="changeLocale(lang.code)" :active="locale === lang.code">
                     <v-list-item-title>{{ lang.name }}</v-list-item-title>
                  </v-list-item>
               </v-list>
            </v-menu>
            <v-menu class="d-none d-sm-flex">
               <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="text">
                     {{ currentUser?.name }}
                     <v-icon right>mdi-chevron-down</v-icon>
                  </v-btn>
               </template>
               <v-list>
                  <v-list-item>
                     <v-list-item-title>
                        <v-chip :color="isAdmin ? 'red' : 'blue'" class="mr-2">
                           {{ isAdmin ? t('user.admin') : t('user.receptionist') }}
                        </v-chip>
                        {{ currentUser?.name }}
                     </v-list-item-title>
                  </v-list-item>
                  <v-divider></v-divider>
                  <v-list-item @click="logout">
                     <v-list-item-title>
                        <v-icon left>mdi-logout</v-icon>
                        {{ t('menu.logout') }}
                     </v-list-item-title>
                  </v-list-item>
               </v-list>
            </v-menu>
         </template>
         <template v-else>
            <v-menu>
               <template v-slot:activator="{ props }">
                  <v-btn v-bind="props" variant="text">
                     {{ locale === 'tr' ? t('language.tr') : t('language.en') }}
                     <v-icon right>mdi-translate</v-icon>
                  </v-btn>
               </template>
               <v-list>
                  <v-list-item v-for="lang in locales" :key="lang.code" @click="changeLocale(lang.code)" :active="locale === lang.code">
                     <v-list-item-title>{{ lang.name }}</v-list-item-title>
                  </v-list-item>
               </v-list>
            </v-menu>
         </template>
      </v-app-bar>

      <v-main>
         <ErrorBoundary>
            <router-view />
         </ErrorBoundary>
         <LoadingOverlay :loading="isLoading" :full-screen="true" />
      </v-main>

      <v-footer app>
         <div class="text-center w-100">&copy; {{ new Date().getFullYear() }} - {{ t('app.footer') }}</div>
      </v-footer>
   </v-app>
</template>

<style>
html,
body {
   margin: 0;
   padding: 0;
}

@media (max-width: 600px) {
   .v-app-bar-title {
      font-size: 1.1rem !important;
      padding: 0 8px;
   }
   .v-app-bar .v-btn:not(.v-btn--icon) {
      display: none !important;
   }
   .v-app-bar .v-menu:not(.d-flex) {
      display: none !important;
   }
}
</style>
