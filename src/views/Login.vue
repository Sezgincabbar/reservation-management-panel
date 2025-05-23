<template>
   <div class="login-container">
      <v-card class="login-card" elevation="8">
         <v-card-title class="text-center">
            <h2>{{ t('login.title') }}</h2>
         </v-card-title>

         <v-card-text>
            <v-form @submit.prevent="handleLogin" class="d-flex flex-column justify-center">
               <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4">
                  {{ authStore.error }}
               </v-alert>

               <v-alert v-if="validationErrors.email" type="error" variant="tonal" density="compact" class="mb-2">
                  {{ validationErrors.email }}
               </v-alert>
               <v-text-field
                  v-model="email"
                  :label="t('login.email')"
                  type="email"
                  required
                  :disabled="authStore.loading"
                  prepend-icon="mdi-email"
                  :error-messages="validationErrors.email"
                  @focus="clearValidationError('email')"
               ></v-text-field>
               <v-alert v-if="validationErrors.password" type="error" variant="tonal" density="compact" class="mb-2">
                  {{ validationErrors.password }}
               </v-alert>
               <v-text-field
                  v-model="password"
                  :label="t('login.password')"
                  type="password"
                  required
                  :disabled="authStore.loading"
                  prepend-icon="mdi-lock"
                  :error-messages="validationErrors.password"
                  @focus="clearValidationError('password')"
               ></v-text-field>

               <div class="login-info mt-4">
                  <p class="text-caption">{{ t('login.demo') }}</p>
                  <p class="text-caption">{{ t('login.admin') }}: admin@example.com / admin123</p>
                  <p class="text-caption">{{ t('login.receptionist') }}: recep@example.com / recep123</p>
                  <p class="text-caption">{{ t('login.receptionist') }} 2: recep2@example.com / recep123</p>
               </div>

               <v-card-actions class="d-flex justify-center mt-4">
                  <v-btn type="submit" color="primary" block :loading="authStore.loading" :disabled="!isFormValid || authStore.loading">
                     {{ t('login.submit') }}
                  </v-btn>
               </v-card-actions>
            </v-form>
         </v-card-text>
      </v-card>
   </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useToast } from 'vue-toastification';
//@ts-ignore
import { useI18n } from 'vue-i18n';
import * as yup from 'yup';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const { t } = useI18n();

const email = ref('');
const password = ref('');
const validationErrors = ref<{ [key: string]: string }>({});

const isFormValid = computed(() => {
   return email.value && password.value;
});

const loginSchema = yup.object({
   email: yup.string().email(t('validation.email')).required(t('validation.emailRequired')),
   password: yup.string().required(t('validation.passwordRequired')),
});

const handleLogin = async () => {
   validationErrors.value = {};
   try {
      await loginSchema.validate({ email: email.value, password: password.value }, { abortEarly: false });

      const success = await authStore.login(email.value, password.value);

      if (success) {
         toast.success(t('login.success'));
         router.push('/');
      }
   } catch (err: any) {
      if (err instanceof yup.ValidationError) {
         err.inner.forEach((error) => {
            if (error.path) {
               validationErrors.value[error.path] = error.message;
            }
         });
      } else {
         console.error(err);
      }
   }
};

const clearValidationError = (field: string) => {
   if (validationErrors.value[field]) {
      delete validationErrors.value[field];
   }
};
</script>

<style scoped>
.login-container {
   display: flex;
   justify-content: center;
   align-items: center;
   min-height: 100%;
   text-align: center;
}

.login-card {
   width: 100%;
   max-width: 450px;
   padding: 1rem;
   text-align: center;
}

.login-info {
   background-color: rgba(0, 0, 0, 0.03);
   padding: 10px;
   border-radius: 4px;
   font-size: 0.8rem;
   text-align: left;
   display: inline-block;
}

.v-input__control {
   text-align: left;
}
</style>
