<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useReservationStore } from '../../stores/reservationStore';
import { useHotelStore } from '../../stores/hotelStore';
import { useAuthStore } from '../../stores/authStore';
import { statusService } from '../../services/api';
import * as yup from 'yup';
import type { Reservation } from '../../types';
import { useToast } from 'vue-toastification';
//@ts-ignore
import { useI18n } from 'vue-i18n';

const router = useRouter();
const route = useRoute();
const reservationStore = useReservationStore();
const hotelStore = useHotelStore();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const id = computed(() => route.params.id as string | undefined);
const isEditing = computed(() => !!id.value);
const title = computed(() => (isEditing.value ? t('reservations.updateReservation') : t('reservations.newReservation')));

const isAdmin = computed(() => authStore.isAdmin);
const userHotelId = computed(() => authStore.userHotelId);

const errors = ref<Record<string, string>>({});
const statuses = computed(() => statusService.getAll().map((status) => ({ title: t(`app.${status.title}`), id: status.id })));

interface FormData {
   name: string;
   surname: string;
   start_date: string;
   end_date: string;
   total_fee: string;
   status: number | null;
   hotel_id: number | null;
}

const form = ref<FormData>({
   name: '',
   surname: '',
   start_date: '',
   end_date: '',
   total_fee: '',
   status: null,
   hotel_id: isAdmin.value ? null : userHotelId.value || null,
});

const selectedStatus = ref<string | null>(null);
const selectedHotel = ref<string | null>(isAdmin.value ? null : userHotelId.value ? String(userHotelId.value) : null);

const updateFormValues = () => {
   if (selectedStatus.value !== null) {
      form.value.status = Number(selectedStatus.value);
   }
   if (selectedHotel.value !== null) {
      if (!isAdmin.value && Number(selectedHotel.value) !== userHotelId.value) {
         toast.error(t('errors.unauthorized'));

         selectedHotel.value = userHotelId.value ? String(userHotelId.value) : null;
         return;
      }
      form.value.hotel_id = Number(selectedHotel.value);
   }
};

watch(
   () => form.value,
   (newValue) => {
      selectedStatus.value = newValue.status !== null ? String(newValue.status) : null;
      selectedHotel.value = newValue.hotel_id !== null ? String(newValue.hotel_id) : null; // Number'ı string'e çevir
   },
   { deep: true },
);

const schema = yup.object({
   name: yup.string().required(t('validation.required')),
   surname: yup.string().required(t('validation.required')),
   start_date: yup.string().required(t('validation.required')),
   end_date: yup
      .string()
      .required(t('validation.required'))
      .test('is-after-start', t('validation.endDateAfterStart'), function (value) {
         const { start_date } = this.parent;
         if (!start_date || !value) return true;
         return new Date(value) > new Date(start_date);
      }),
   total_fee: yup.string().required(t('validation.required')),
   status: yup.number().required(t('validation.required')),
   hotel_id: yup.number().required(t('validation.required')),
});

const calculateTotalFee = () => {
   if (!form.value.start_date || !form.value.end_date) return;

   const start = new Date(form.value.start_date);
   const end = new Date(form.value.end_date);

   if (end <= start) return;

   const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
   const baseRate = 100;
   const total = days * baseRate;

   form.value.total_fee = total.toFixed(2);
};

const validate = async () => {
   try {
      errors.value = {};
      await schema.validate(form.value, { abortEarly: false });
      return true;
   } catch (error) {
      if (error instanceof yup.ValidationError) {
         error.inner.forEach((err) => {
            if (err.path) {
               errors.value[err.path] = err.message;
            }
         });
      }
      return false;
   }
};

const saveReservation = async () => {
   if (!(await validate())) return;

   try {
      const formData = { ...form.value };

      if (formData.status === null) formData.status = 2;
      if (formData.hotel_id === null) formData.hotel_id = 1;

      const reservationData = {
         name: formData.name,
         surname: formData.surname,
         start_date: formData.start_date,
         end_date: formData.end_date,
         total_fee: formData.total_fee,
         status: formData.status as number,
         hotel_id: formData.hotel_id as number,
      };

      if (isEditing.value && id.value) {
         await reservationStore.updateReservation(id.value, reservationData);
         toast.success(t('reservations.updateSuccess'));
      } else {
         await reservationStore.createReservation(reservationData as Omit<Reservation, 'id' | 'createdAt'>);
         toast.success(t('reservations.createSuccess'));
      }
      router.push('/reservations');
   } catch (error) {
      toast.error(t('reservations.saveError'));
      console.error(error);
   } finally {
   }
};

const loadData = async () => {
   try {
      const hotelsPromise = hotelStore.fetchHotels();

      let reservationPromise = Promise.resolve();
      if (isEditing.value && id.value) {
         reservationPromise = reservationStore.fetchReservation(id.value);
      }

      await Promise.all([hotelsPromise, reservationPromise]);

      if (isEditing.value && reservationStore.currentReservation) {
         const reservation = reservationStore.currentReservation;

         // // Resepsiyonist sadece kendi otelinin rezervasyonlarını düzenleyebilir
         // if (!isAdmin.value && reservation.hotel_id != userHotelId.value) {
         //    toast.error('Bu rezervasyonu düzenleme yetkiniz yok');
         //    router.push('/reservations');
         //    return;
         // }

         form.value = {
            name: reservation.name,
            surname: reservation.surname,
            start_date: reservation.start_date,
            end_date: reservation.end_date,
            total_fee: reservation.total_fee,
            status: reservation.status,
            hotel_id: reservation.hotel_id,
         };

         selectedStatus.value = String(reservation.status);
         selectedHotel.value = String(reservation.hotel_id);
      }
   } catch (error) {
      toast.error(t('reservations.loadError'));
      console.error(error);
   } finally {
   }
};

onMounted(async () => {
   await loadData();
});
</script>

<template>
   <v-container>
      <v-row>
         <v-col cols="12">
            <v-card>
               <v-card-title class="text-h5">{{ title }}</v-card-title>
               <v-card-text>
                  <v-form @submit.prevent="saveReservation">
                     <v-row>
                        <v-col cols="12" md="6">
                           <v-text-field v-model="form.name" :label="t('reservations.firstName')" :error-messages="errors.name" required></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                           <v-text-field v-model="form.surname" :label="t('reservations.lastName')" :error-messages="errors.surname" required></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                           <v-text-field
                              v-model="form.start_date"
                              :label="t('reservations.startDate')"
                              type="date"
                              :error-messages="errors.start_date"
                              required
                              @input="calculateTotalFee"
                           ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                           <v-text-field
                              v-model="form.end_date"
                              :label="t('reservations.endDate')"
                              type="date"
                              :error-messages="errors.end_date"
                              required
                              @input="calculateTotalFee"
                           ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                           <v-text-field
                              v-model="form.total_fee"
                              :label="t('reservations.totalFee') + ' (₺)'"
                              type="number"
                              :error-messages="errors.total_fee"
                              required
                           ></v-text-field>
                        </v-col>

                        <v-col cols="12" md="6">
                           <v-select
                              v-model="selectedStatus"
                              :items="statuses"
                              item-title="title"
                              item-value="id"
                              :label="t('reservations.status')"
                              :error-messages="errors.status"
                              required
                              @update:model-value="updateFormValues"
                           ></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                           <v-select
                              v-model="selectedHotel"
                              :items="hotelStore.hotels"
                              item-title="name"
                              item-value="id"
                              :label="t('reservations.hotel')"
                              :error-messages="errors.hotel_id"
                              required
                              @update:model-value="updateFormValues"
                           ></v-select>
                        </v-col>
                     </v-row>
                  </v-form>
               </v-card-text>

               <v-card-actions class="pa-4">
                  <v-spacer></v-spacer>
                  <v-btn color="secondary" @click="router.push('/reservations')">
                     {{ t('app.cancel') }}
                  </v-btn>
                  <v-btn color="primary" @click="saveReservation">
                     {{ isEditing ? t('app.update') : t('app.create') }}
                  </v-btn>
               </v-card-actions>
            </v-card>
         </v-col>
      </v-row>
   </v-container>
</template>
