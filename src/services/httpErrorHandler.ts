import { useToast } from 'vue-toastification';
//@ts-ignore
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

// HTTP hata kodları için işleyiciler
export const handleHttpError = (error: any) => {
   const toast = useToast();
   const { t } = useI18n();
   const router = useRouter();
   const authStore = useAuthStore();

   // Axios hata yanıtı
   const status = error.response?.status;

   switch (status) {
      case 401: // Yetkisiz
         toast.error(t('errors.unauthorized'));
         // Kullanıcıyı çıkış yap ve login sayfasına yönlendir
         authStore.logout();
         router.push('/login');
         break;

      case 403: // Yasak
         toast.error(t('errors.forbidden'));
         router.push('/');
         break;

      case 404: // Bulunamadı
         toast.error(t('errors.notFound'));
         break;

      case 500: // Sunucu hatası
      case 502: // Bad Gateway
      case 503: // Service Unavailable
         toast.error(t('errors.serverError'));
         break;

      default:
         // Ağ hatası veya diğer hatalar
         if (!error.response) {
            toast.error(t('errors.networkError'));
         } else {
            toast.error(error.message || t('errors.defaultError'));
         }
         break;
   }

   return Promise.reject(error);
};
