<template>
  <div id="root">
    <AppHeader />
    <main class="layout-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppHeader from '~/components/Header/AppHeader.vue';
</script>

<style scoped lang="scss">
.layout-content {
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
