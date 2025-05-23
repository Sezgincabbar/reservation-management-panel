<script lang="ts">
import { ref, onErrorCaptured, defineComponent } from 'vue';
import i18n from '../i18n';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'ErrorBoundary',
  setup() {
    const router = useRouter();
    // Global i18n instance'ından t fonksiyonunu al
    const { t } = i18n.global;
    
    const error = ref<Error | null>(null);
    const errorInfo = ref<string>('');
    // Geliştirme ortamında olup olmadığını kontrol etmek için
    // Vite'da import.meta.env.MODE kullanılır ancak hata alıyoruz
    // Bu nedenle şimdilik geliştirme ortamında olduğumuzu varsayalım
    const isDevelopment = ref(true);

    // Hata yakalama
    onErrorCaptured((err: Error, _instance, info) => {
      error.value = err;
      errorInfo.value = info;
      console.error('Yakalanan hata:', err, info);
      return false; // Hatanın yukarı yayılmasını engelle
    });

    // Hatayı temizle ve ana sayfaya dön
    const goToHome = () => {
      error.value = null;
      errorInfo.value = '';
      router.push('/');
    };

    // Hatayı temizle ve sayfayı yenile
    const retry = () => {
      error.value = null;
      errorInfo.value = '';
      window.location.reload();
    };

    return {
      error,
      errorInfo,
      isDevelopment,
      t,
      goToHome,
      retry
    };
  }
});
</script>

<template>
  <div v-if="error" class="error-boundary">
    <v-card class="error-card" color="error" theme="dark">
      <v-card-title class="text-h5">
        <v-icon icon="mdi-alert-circle" class="mr-2" />
        {{ t('errors.title') }}
      </v-card-title>
      
      <v-card-text>
        <p class="text-body-1">{{ t('errors.message') }}</p>
        <p class="text-body-2 mt-2">{{ error.message }}</p>
        
        <v-alert v-if="isDevelopment" 
                color="warning" 
                variant="tonal" 
                class="mt-4">
          <pre class="error-stack">{{ error.stack }}</pre>
        </v-alert>
      </v-card-text>
      
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="white" variant="outlined" @click="retry">
          {{ t('errors.retry') }}
        </v-btn>
        <v-btn color="white" variant="outlined" @click="goToHome">
          {{ t('errors.home') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </div>
  
  <slot v-else></slot>
</template>

<style scoped>
.error-boundary {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50vh;
}

.error-card {
  width: 100%;
  max-width: 600px;
}

.error-stack {
  white-space: pre-wrap;
  font-size: 12px;
  overflow-x: auto;
  max-height: 200px;
}
</style> 