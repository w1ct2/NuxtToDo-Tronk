<!-- Лаяут для странички входа, без хэдера -->
<template>
  <div id="root">
    <main class="layout-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped lang="scss">
.layout-content {
  display: flex;
  flex: 1;
  flex-direction: column;
}
</style>
