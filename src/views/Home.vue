<script setup lang="ts">
import { useRouter } from 'vue-router';
//@ts-ignore
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const navigateTo = (path: string) => {
   router.push(path);
};
</script>

<template>
   <v-container>
      <v-row class="mt-4">
         <v-col cols="12">
            <v-card>
               <v-card-title class="text-h4 text-center">
                  {{ t('home.title') }}
               </v-card-title>
               <v-card-text class="text-center">
                  <p class="text-body-1 mb-4">
                     {{ t('home.welcome') }}
                  </p>
               </v-card-text>
               <v-card-actions class="justify-center pa-4">
                  <v-btn color="primary" size="large" class="mr-4" @click="navigateTo('/reservations')">
                     {{ t('home.viewReservations') }}
                  </v-btn>
                  <v-btn color="secondary" size="large" @click="navigateTo('/hotels')">
                     {{ t('home.viewHotels') }}
                  </v-btn>
               </v-card-actions>
            </v-card>
         </v-col>
      </v-row>
   </v-container>
</template>
