import { createApp } from 'vue';
import { createPinia } from 'pinia';

import { createRouter, createWebHistory } from 'vue-router';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import 'vuetify/styles';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import App from './App.vue';
import routes from './router';
import './style.css';
import i18n from './i18n';
import '@mdi/font/css/materialdesignicons.css';
import { useAuthStore } from './stores/authStore';

const app = createApp(App);
const pinia = createPinia();
const router = createRouter({
   history: createWebHistory(),
   routes,
});

const vuetify = createVuetify({
   components,
   directives,
});

const toastOptions = {
   position: 'top-right',
   timeout: 3000,
   closeOnClick: true,
   pauseOnFocusLoss: true,
   pauseOnHover: true,
   draggable: true,
   draggablePercent: 0.6,
   showCloseButtonOnHover: false,
   hideProgressBar: false,
   closeButton: 'button',
   icon: true,
   rtl: false,
};

app.use(pinia);

router.beforeEach((to, _from, next) => {
   const authStore = useAuthStore();

   authStore.checkAuth();

   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'Login' });
   } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
      next({ name: 'Home' });
   } else {
      next();
   }
});

app.use(router);
app.use(vuetify);
app.use(Toast, toastOptions);
app.use(i18n);
app.mount('#app');
