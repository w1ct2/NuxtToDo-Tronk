<template>
  <section class="task-list-board" aria-live="polite">
    <header class="task-list-board__head">
      <span>Список задач</span>
      <span>{{ tasks.length }}</span>
    </header>

    <ul class="task-list-board__list">
      <TaskItem v-for="task in tasks" :key="task.id" :task="task" />

      <li v-if="!tasks.length" class="task-list-board__empty">
        По выбранному фильтру задач пока нет.
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import TaskItem from './TaskItem.vue';
import type { TodoTask } from './types';

defineProps({
  tasks: {
    type: Array as PropType<TodoTask[]>,
    default: () => [],
  },
});
</script>

<style scoped lang="scss">
.task-list-board {
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  overflow: hidden;
  background: var(--bg);
}

.task-list-board__head {
  min-height: 50px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 16px;
  border-bottom: 1px solid var(--border);
  color: var(--text-h);
  font-weight: 500;
  background: rgba(0, 0, 0, 0.02);
}

.task-list-board__list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.task-list-board__empty {
  padding: 18px 16px;
}
</style>
