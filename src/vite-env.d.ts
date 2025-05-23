/// <reference types="vite/client" />

declare module '*.vue' {
   import type { DefineComponent } from 'vue';
   const component: DefineComponent<{}, {}, any>;
   export default component;
}

declare module 'vuetify/styles' {}

declare module 'vue-i18n' {
   import { DefineComponent } from 'vue';
   const component: DefineComponent<{}, {}, any>;
   export default component;
}
