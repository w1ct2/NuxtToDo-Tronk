<template>
  <header class="app-header">
    <nav class="app-header__nav">
      <h2>ToDo-Tronk</h2>
      <h3 class="app-header__h3">Мой список задач:</h3>
      <AppButton variant="secondary" style="margin-left: auto;">+ Добавить задачу</AppButton>
    </nav>
  </header>
</template>

<script setup lang="ts">
import AppButton from '~/components/UI/AppButton.vue';

</script>

<style scoped lang="scss">
.app-header {
  height: 75px;
  padding: 0 15px;
  border-bottom: 1px solid var(--border);
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 12px;
  height: 100%;
}

.app-header__link {
  color: var(--text-h);
  text-decoration: none;
  font-weight: 500;
}

.app-header__link.router-link-active {
  color: var(--accent);
}

.app-header__h3 {
  height: 100%;
  margin-left: 40px;
  border-left: 1px solid var(--border);
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 15px;
}
</style>
