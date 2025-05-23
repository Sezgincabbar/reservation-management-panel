<script lang="ts">
import { ref, watch, defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingOverlay',
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    fullScreen: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const localLoading = ref(props.loading);

    watch(() => props.loading, (newValue) => {
      localLoading.value = newValue;
    });

    return {
      localLoading
    };
  }
});
</script>

<template>
  <div v-if="localLoading" 
       :class="['loading-overlay', { 'full-screen': fullScreen }]">
    <div class="loading-content">
      <v-skeleton-loader
       type="list-item-three-line"
        height="300px"
        width="800px"
      ></v-skeleton-loader>
    </div>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 999;
}

.loading-overlay.full-screen {
  position: fixed;
  z-index: 9999;
}

.loading-content {
  padding: 20px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style> 
