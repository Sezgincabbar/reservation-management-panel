<template>
   <div class="not-found">
      <v-card class="not-found-card">
         <v-card-title class="text-h3 text-center"> 404 </v-card-title>
         <v-card-text class="text-center">
            <p class="text-h5 mb-4">{{ t('errors.notFound') }}</p>
            <p class="text-body-1">{{ t('errors.message') }}</p>
         </v-card-text>
         <v-card-actions class="justify-center">
            <v-btn color="primary" @click="goToHome">
               {{ t('errors.home') }}
            </v-btn>
         </v-card-actions>
      </v-card>
   </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
//@ts-ignore
import { useI18n } from 'vue-i18n';

const router = useRouter();
const { t } = useI18n();

const goToHome = () => {
   router.push('/');
};
</script>

<style scoped>
.not-found {
   display: flex;
   justify-content: center;
   align-items: center;
   min-height: 80vh;
   padding: 20px;
}

.not-found-card {
   max-width: 500px;
   width: 100%;
   padding: 20px;
}
</style>
