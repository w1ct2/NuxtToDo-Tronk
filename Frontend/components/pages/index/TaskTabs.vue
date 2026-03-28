<template>
  <div class="task-tabs" role="tablist" aria-label="Фильтры задач">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      type="button"
      class="task-tabs__button"
      :class="{ 'is-active': tab.key === activeTab }"
      role="tab"
      :aria-selected="tab.key === activeTab"
      @click="emit('change', tab.key)"
    >
      <span>{{ tab.label }}</span>
      <span class="task-tabs__count">{{ tab.count ?? 0 }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import type { TaskFilter, TaskTab } from './types';

defineProps({
  tabs: {
    type: Array as PropType<TaskTab[]>,
    default: () => [],
  },
  activeTab: {
    type: String as PropType<TaskFilter>,
    default: 'all',
  },
});

const emit = defineEmits<{
  change: [value: TaskFilter];
}>();
</script>

<style scoped lang="scss">
.task-tabs {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  padding: 6px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: var(--code-bg);
  margin-left: 15px;
  margin-top: 15px;
}

.task-tabs__button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid transparent;
  border-radius: 10px;
  background: transparent;
  color: var(--text);
  font: inherit;
  font-size: 14px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
}

.task-tabs__button:hover {
  border-color: var(--accent-border);
}

.task-tabs__button.is-active {
  color: var(--text-h);
  border-color: var(--accent-border);
  background: var(--accent-bg);
}

.task-tabs__count {
  min-width: 22px;
  height: 22px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.08);
  font-size: 12px;
  line-height: 1;
}
</style>
