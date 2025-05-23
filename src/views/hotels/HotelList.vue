<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useHotelStore } from '../../stores/hotelStore';
//@ts-ignore
import { useI18n } from 'vue-i18n';

const hotelStore = useHotelStore();
const { t } = useI18n();

const error = computed(() => hotelStore.error);
const hotels = computed(() => hotelStore.hotels);

onMounted(async () => {
   await hotelStore.fetchHotels();
});
</script>

<template>
   <v-container>
      <v-row>
         <v-col cols="12">
            <v-card>
               <v-card-title class="text-h5">
                  {{ t('hotels.title') }}
               </v-card-title>

               <v-card-text>
                  <div v-if="error" class="text-center red--text">
                     {{ error }}
                  </div>

                  <div v-else-if="hotels.length === 0" class="text-center">
                     {{ t('hotels.noHotel') }}
                  </div>

                  <v-table v-else>
                     <thead>
                        <tr>
                           <th>{{ t('hotels.id') }}</th>
                           <th>{{ t('hotels.name') }}</th>
                           <th>{{ t('hotels.createdAt') }}</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="hotel in hotels" :key="hotel.id">
                           <td>{{ hotel.id }}</td>
                           <td>{{ hotel.name }}</td>
                           <td>{{ new Date(hotel.createdAt).toLocaleDateString('tr-TR') }}</td>
                        </tr>
                     </tbody>
                  </v-table>
               </v-card-text>
            </v-card>
         </v-col>
      </v-row>
   </v-container>
</template>
