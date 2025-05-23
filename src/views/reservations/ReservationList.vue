<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useReservationStore } from '../../stores/reservationStore';
import { useHotelStore } from '../../stores/hotelStore';
import { useAuthStore } from '../../stores/authStore';
import { statusService } from '../../services/api';
import type { Status, Reservation } from '../../types';
import { useToast } from 'vue-toastification';
import { AiFillEdit, AiFillDelete } from 'vue-icons-plus/ai';
import { MdOutlineChangeCircle } from 'vue-icons-plus/md';
//@ts-ignore
import { useI18n } from 'vue-i18n';
const router = useRouter();
const reservationStore = useReservationStore();
const hotelStore = useHotelStore();
const authStore = useAuthStore();
const toast = useToast();
const { t, locale } = useI18n();
const allReservations = computed(() => reservationStore.reservations);
const hotels = computed(() => hotelStore.hotels);
const statuses = computed(() => statusService.getAll().map((status) => ({ title: t(`app.${status.title}`), id: status.id })));

const currentPage = ref(1);
const itemsPerPage = ref(5);

const filters = ref({
   status: null as string | null,
   hotelId: null as string | null,
   guestName: '',
   dateRange: [] as string[],
});

const loadFiltersFromSession = () => {
   const savedFilters = sessionStorage.getItem('reservationFilters');
   const savedPage = sessionStorage.getItem('reservationPage');
   const savedItemsPerPage = sessionStorage.getItem('reservationItemsPerPage');

   if (savedFilters) {
      try {
         const parsedFilters = JSON.parse(savedFilters);
         filters.value = {
            ...filters.value,
            ...parsedFilters,
         };
      } catch (e) {
         console.error('Filtre yükleme hatası:', e);
      }
   }

   if (savedPage) {
      currentPage.value = parseInt(savedPage, 10);
   }

   if (savedItemsPerPage) {
      itemsPerPage.value = parseInt(savedItemsPerPage, 10);
   }
};

const saveFiltersToSession = () => {
   sessionStorage.setItem('reservationFilters', JSON.stringify(filters.value));
   sessionStorage.setItem('reservationPage', currentPage.value.toString());
   sessionStorage.setItem('reservationItemsPerPage', itemsPerPage.value.toString());
};

watch(
   [filters, currentPage, itemsPerPage],
   () => {
      saveFiltersToSession();
   },
   { deep: true },
);

const isAdmin = computed(() => authStore.isAdmin);
const userHotelId = computed(() => authStore.userHotelId);
const canDeleteReservation = computed(() => authStore.canDeleteReservation);
const canCreateReservation = computed(() => authStore.canCreateReservation);
const canChangeStatus = computed(() => authStore.canUpdateReservationStatus);

const reservations = computed(() => {
   let filteredReservations = [...allReservations.value];

   if (filters.value.status !== null) {
      filteredReservations = filteredReservations.filter((r) => String(r.status) === filters.value.status);
   }

   if (filters.value.hotelId !== null) {
      filteredReservations = filteredReservations.filter((r) => String(r.hotel_id) === filters.value.hotelId);
   } else if (!isAdmin.value && userHotelId.value) {
      filteredReservations = filteredReservations.filter((r) => r.hotel_id === userHotelId.value);
   }

   if (filters.value.guestName && filters.value.guestName.trim() !== '') {
      const searchTerm = filters.value.guestName.toLowerCase().trim();
      filteredReservations = filteredReservations.filter((r) => r.name.toLowerCase().includes(searchTerm) || r.surname.toLowerCase().includes(searchTerm));
   }

   if (filters.value.dateRange && filters.value.dateRange.length === 2) {
      const startDate = new Date(filters.value.dateRange[0]);
      const endDate = new Date(filters.value.dateRange[1]);

      filteredReservations = filteredReservations.filter((r) => {
         const rStartDate = new Date(r.start_date);
         const rEndDate = new Date(r.end_date);
         return rStartDate >= startDate && rEndDate <= endDate;
      });
   }

   return filteredReservations;
});

const headers = [
   { title: 'firstName', key: 'name', sortable: true },
   { title: 'lastName', key: 'surname', sortable: true },
   { title: 'startDate', key: 'start_date', sortable: true },
   { title: 'endDate', key: 'end_date', sortable: true },
   { title: 'totalFee', key: 'total_fee', sortable: true },
   { title: 'status', key: 'status', sortable: true },
   { title: 'hotel', key: 'hotel_id', sortable: true },
   { title: 'actions', key: 'actions', sortable: false },
];

const deleteDialog = ref(false);
const statusDialog = ref(false);
const reservationToDelete = ref<string | null>(null);
const reservationToUpdateStatus = ref<Reservation | null>(null);
const selectedStatus = ref<Status | null>(null);
const loading = computed(() => reservationStore.loading);
const error = computed(() => reservationStore.error);

const getHotelName = (hotelId: number): string => {
   const hotel = hotels.value.find((h) => Number(h.id) === hotelId);
   return hotel ? hotel.name : 'Bilinmeyen Otel';
};

const getStatusInfo = (statusId: number): Status => {
   return statuses.value.find((s) => Number(s.id) === statusId) || { title: 'Bilinmeyen Durum', id: '0' };
};

const getStatusColor = (statusId: number): string => {
   switch (statusId) {
      case 1:
         return 'success';
      case 2:
         return 'warning';
      case 3:
         return 'error';
      default:
         return 'grey-lighten-1';
   }
};

const editReservation = (id: string) => {
   router.push(`/reservations/${id}/edit`);
};

const createReservation = () => {
   router.push('/reservations/create');
};

const confirmDelete = (id: string) => {
   reservationToDelete.value = id;
   deleteDialog.value = true;
};

const deleteReservation = async () => {
   if (!reservationToDelete.value) return;

   try {
      await reservationStore.deleteReservation(reservationToDelete.value);
      toast.success('Rezervasyon başarıyla silindi');
      loadReservations();
   } catch (error) {
      toast.error('Rezervasyon silinirken bir hata oluştu');
   } finally {
      deleteDialog.value = false;
      reservationToDelete.value = null;
   }
};

const canManageReservation = (reservation: Reservation): boolean => {
   return authStore.canManageHotelReservations(reservation.hotel_id);
};

const resetFilters = () => {
   filters.value = {
      status: null,
      hotelId: null,
      guestName: '',
      dateRange: [],
   };

   currentPage.value = 1;

   sessionStorage.removeItem('reservationFilters');
   sessionStorage.removeItem('reservationPage');
};

const loadReservations = async () => {
   try {
      await reservationStore.fetchReservations({});
      await hotelStore.fetchHotels();
   } catch (error) {
      toast.error('Rezervasyonlar yüklenirken bir hata oluştu');
      console.error('Rezervasyon yükleme hatası:', error);
      return Promise.reject(error);
   }
};

const userRole = computed(() => {
   return authStore.isAdmin ? 'Admin' : 'Resepsiyonist';
});

const userHotel = computed(() => {
   if (!userHotelId.value) return null;
   return hotels.value.find((h) => Number(h.id) === Number(userHotelId.value));
});

const openStatusDialog = (reservation: Reservation) => {
   reservationToUpdateStatus.value = reservation;
   selectedStatus.value = getStatusInfo(reservation.status) || null;
   statusDialog.value = true;
};

const updateReservationStatus = async () => {
   if (!reservationToUpdateStatus.value || !selectedStatus.value) return;

   try {
      await reservationStore.updateReservation(reservationToUpdateStatus.value.id, { status: parseInt(selectedStatus.value.id) });
      toast.success('Rezervasyon durumu başarıyla güncellendi');
      loadReservations();
   } catch (error) {
      toast.error('Durum güncellenirken bir hata oluştu');
   } finally {
      statusDialog.value = false;
      reservationToUpdateStatus.value = null;
      selectedStatus.value = null;
   }
};

function formatDate(dateStr: string) {
   if (!dateStr) return '';
   const date = new Date(dateStr);
   // Kullanıcı diline göre formatla
   return date.toLocaleDateString(locale.value === 'tr' ? 'tr-TR' : 'en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
   });
}

onMounted(async () => {
   loadFiltersFromSession();

   await loadReservations();
});
</script>

<template>
   <div class="reservation-page">
      <div class="d-flex justify-space-between align-center mb-4">
         <h1 class="text-h5 font-weight-medium">{{ t('reservations.reservation', 'Reservations') }}</h1>
         <v-btn v-if="canCreateReservation" color="primary" @click="createReservation"> {{ t('reservations.newReservation', 'New Reservation') }} </v-btn>
      </div>

      <v-card class="mb-4 pa-4">
         <div class="d-flex align-center">
            <v-icon icon="mdi-account" class="mr-2"></v-icon>
            <div>
               <span class="font-weight-medium">{{ t('reservations.role', 'Rol') }}: {{ t('user.' + userRole.toLowerCase(), userRole) }}</span>
               <span v-if="!isAdmin && userHotel" class="ml-4">
                  <v-icon icon="mdi-hotel" class="mr-1"></v-icon>
                  {{ t('reservations.hotel', 'Otel') }}: {{ userHotel.name }}
               </span>
            </div>
         </div>
      </v-card>

      <v-card class="mb-4 pa-4">
         <div class="d-flex gap-8 align-start flex-wrap px-4 ga-2">
            <v-text-field
               v-model="filters.guestName"
               :placeholder="t('reservations.guestName', 'Guest name')"
               variant="outlined"
               density="comfortable"
               hide-details
               clearable
               prepend-inner-icon="mdi-magnify"
               class="flex-grow-1"
            ></v-text-field>

            <v-select
               v-if="isAdmin"
               v-model="filters.hotelId"
               :items="hotels"
               item-title="name"
               item-value="id"
               :placeholder="t('reservations.hotel')"
               variant="outlined"
               density="comfortable"
               hide-details
               clearable
               class="flex-grow-1"
               :return-object="false"
            ></v-select>

            <v-select
               v-model="filters.status"
               :items="statuses"
               item-title="title"
               item-value="id"
               :placeholder="t('reservations.status', 'Status')"
               variant="outlined"
               density="comfortable"
               hide-details
               clearable
               class="flex-grow-1"
               :return-object="false"
            ></v-select>

            <v-btn color="error" prepend-icon="mdi-close" size="large" variant="tonal" @click="resetFilters"> {{ t('app.clear', 'Temizle') }} </v-btn>
         </div>
      </v-card>

      <v-card>
         <v-skeleton-loader v-if="loading" type="table"></v-skeleton-loader>

         <div v-else-if="error" class="pa-8 text-center text-error">
            {{ error }}
            <div class="mt-4">
               <v-btn color="primary" @click="loadReservations"> {{ t('errors.retry', 'Tekrar Dene') }} </v-btn>
            </div>
         </div>

         <div v-else-if="reservations.length === 0" class="pa-8 text-center text-grey">Henüz rezervasyon bulunmamaktadır.</div>

         <template v-else>
            <div class="d-flex justify-end px-4 pt-2 mb-2">
               <v-chip color="primary" size="small">
                  {{ t('reservations.totalCount', { count: reservations?.length }) }}
               </v-chip>
            </div>

            <v-data-table
               :headers="headers.map((h) => ({ ...h, title: t('reservations.' + h.title) }))"
               :items="reservations"
               :items-per-page="itemsPerPage"
               v-model:page="currentPage"
               class="elevation-1"
               no-data-text="t('reservations.noReservation', 'Rezervasyon bulunamadı')"
            >
               <template #[`item.total_fee`]="{ item }"> {{ item.total_fee }} ₺ </template>

               <template #[`item.status`]="{ item }">
                  <v-chip :color="getStatusColor(item.status)" size="small" text-color="white">
                     {{ getStatusInfo(item.status)?.title }}
                  </v-chip>
               </template>

               <template #[`item.hotel_id`]="{ item }">
                  {{ getHotelName(item.hotel_id) }}
               </template>

               <template #[`item.start_date`]="{ item }">
                  {{ formatDate(item.start_date) }}
               </template>

               <template #[`item.end_date`]="{ item }">
                  {{ formatDate(item.end_date) }}
               </template>

               <template #[`item.actions`]="{ item }">
                  <div class="d-flex justify-center">
                     <v-btn v-if="canManageReservation(item)" icon variant="text" color="primary" @click="editReservation(item.id)" density="comfortable">
                        <AiFillEdit />
                     </v-btn>

                     <v-btn
                        v-if="canChangeStatus && canManageReservation(item)"
                        icon
                        variant="text"
                        color="warning"
                        @click="openStatusDialog(item)"
                        density="comfortable"
                        title="Durum Değiştir"
                     >
                        <MdOutlineChangeCircle />
                     </v-btn>

                     <v-btn
                        v-if="canDeleteReservation && canManageReservation(item)"
                        icon
                        variant="text"
                        color="error"
                        @click="confirmDelete(item.id)"
                        density="comfortable"
                     >
                        <AiFillDelete />
                     </v-btn>
                  </div>
               </template>

               <template #bottom>
                  <div class="d-flex align-center justify-space-between pa-4">
                     <v-pagination v-model="currentPage" :length="Math.ceil(reservations.length / itemsPerPage)" :total-visible="5" rounded></v-pagination>

                     <v-select
                        v-model="itemsPerPage"
                        :items="[5, 10, 20, 50]"
                        :label="t('reservations.perPage', 'Sayfa başına')"
                        density="compact"
                        variant="outlined"
                        hide-details
                        style="width: 120px"
                     ></v-select>
                  </div>
               </template>
            </v-data-table>
         </template>
      </v-card>

      <v-dialog v-model="deleteDialog" max-width="500px">
         <v-card>
            <v-card-title class="text-h5 bg-error text-white"> {{ t('reservations.reservationDeleteTitle', 'Rezervasyon Silme') }} </v-card-title>
            <v-card-text class="pt-4"> {{ t('reservations.reservationDeleteConfirmation', 'Bu rezervasyonu silmek istediğinize emin misiniz?') }} </v-card-text>
            <v-card-actions>
               <v-spacer></v-spacer>
               <v-btn color="grey" variant="text" @click="deleteDialog = false"> {{ t('app.cancel', 'İptal') }} </v-btn>
               <v-btn color="error" variant="elevated" @click="deleteReservation"> {{ t('app.delete', 'Sil') }} </v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>

      <v-dialog v-model="statusDialog" max-width="500px">
         <v-card>
            <v-card-title class="text-h5 bg-warning text-white"> {{ t('reservations.statusChangeTitle', 'Rezervasyon Durumu Değiştir') }} </v-card-title>
            <v-card-text class="pt-4">
               <div v-if="reservationToUpdateStatus" class="mb-4">
                  <div>
                     <strong>{{ t('reservations.guest', 'Misafir') }}:</strong> {{ reservationToUpdateStatus.name }} {{ reservationToUpdateStatus.surname }}
                  </div>
                  <div>
                     <strong>{{ t('reservations.currentStatus', 'Mevcut Durum') }}:</strong>
                     <v-chip :color="getStatusColor(reservationToUpdateStatus.status)" size="small" text-color="white" class="ml-2">
                        {{ getStatusInfo(reservationToUpdateStatus.status)?.title || '' }}
                     </v-chip>
                  </div>
               </div>
               <v-select
                  v-model="selectedStatus"
                  :items="statuses"
                  item-title="title"
                  item-value="id"
                  :label="t('reservations.newStatus', 'Yeni Durum')"
                  variant="outlined"
                  density="comfortable"
                  return-object
               ></v-select>
            </v-card-text>
            <v-card-actions>
               <v-spacer></v-spacer>
               <v-btn color="grey" variant="text" @click="statusDialog = false"> {{ t('app.cancel', 'İptal') }} </v-btn>
               <v-btn color="warning" variant="elevated" @click="updateReservationStatus" :disabled="!selectedStatus">
                  {{ t('app.update', 'Güncelle') }}
               </v-btn>
            </v-card-actions>
         </v-card>
      </v-dialog>
   </div>
</template>

<style scoped>
.reservation-page {
   padding: 20px;
   min-height: 100vh;
   display: flex;
   flex-direction: column;
   background-color: #f5f5f5;
}
</style>
