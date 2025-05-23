import type { RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';

const routes: RouteRecordRaw[] = [
   {
      path: '/',
      name: 'Home',
      component: Home,
      meta: {
         requiresAuth: true,
      },
   },
   {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
         requiresAuth: false,
      },
   },
   {
      path: '/reservations',
      name: 'ReservationList',
      component: () => import('../views/reservations/ReservationList.vue'),
      meta: {
         requiresAuth: true,
      },
   },
   {
      path: '/reservations/create',
      name: 'ReservationCreate',
      component: () => import('../views/reservations/ReservationForm.vue'),
      meta: {
         requiresAuth: true,
         requiresAdmin: true,
      },
   },
   {
      path: '/reservations/:id/edit',
      name: 'ReservationEdit',
      component: () => import('../views/reservations/ReservationForm.vue'),
      props: true,
      meta: {
         requiresAuth: true,
      },
   },
   {
      path: '/hotels',
      name: 'HotelList',
      component: () => import('../views/hotels/HotelList.vue'),
      meta: {
         requiresAuth: true,
         requiresAdmin: true,
      },
   },
   {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFound.vue'),
      meta: {
         requiresAuth: false,
      },
   },
];

export default routes;
