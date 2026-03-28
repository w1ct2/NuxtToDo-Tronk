<template>
  <section class="task-page">
    <nav class="task-page__header">
      <TaskTabs
        :tabs="tabsWithCounts"
        :active-tab="activeTab"
        @change="(value) => (activeTab = value)"
      />
    </nav>

    <TaskList :tasks="filteredTasks" />
  </section>
</template>

<script setup lang="ts">
import TaskList from '~/components/pages/index/TaskList.vue';
import TaskTabs from '~/components/pages/index/TaskTabs.vue';
import type { TaskFilter, TaskTab, TodoTask } from '~/components/pages/index/types';

definePageMeta({
  middleware: 'is-auth',
});

const activeTab = ref<TaskFilter>('all');

const tasks = ref<TodoTask[]>([
  {
    id: 101,
    title: 'Подготовить макет дашборда',
    description: 'Собрать финальную версию макета с состояниями пустого списка, загрузки и ошибок.',
    dueDate: '2026-03-30',
    isCompleted: false,
    createdBy: 'Анна К.',
    priority: 'high',
  },
  {
    id: 102,
    title: 'Проверить API для задач',
    description: 'Проверить фильтрацию по статусам и корректность пагинации на большом наборе данных.',
    dueDate: '2026-03-28',
    isCompleted: true,
    createdBy: 'Иван П.',
    priority: 'medium',
  },
  {
    id: 103,
    title: 'Обновить документацию проекта',
    description: 'Добавить в README раздел с описанием структуры компонентов страницы задач.',
    dueDate: '2026-04-02',
    isCompleted: false,
    createdBy: 'Мария С.',
    priority: 'low',
  },
  {
    id: 104,
    title: 'Починить отступы в мобильной версии',
    description: 'Проверить страницу на ширине 320-430px и выровнять блоки действий в карточках задач.',
    dueDate: '2026-03-29',
    isCompleted: true,
    createdBy: 'Олег Р.',
    priority: 'high',
  },
]);

const allTabs: TaskTab[] = [
  { key: 'all', label: 'Все задачи' },
  { key: 'completed', label: 'Выполненные' },
  { key: 'active', label: 'Активные' },
];

const filteredTasks = computed(() => {
  if (activeTab.value === 'completed') {
    return tasks.value.filter((task) => task.isCompleted);
  }

  if (activeTab.value === 'active') {
    return tasks.value.filter((task) => !task.isCompleted);
  }

  return tasks.value;
});

const tabsWithCounts = computed(() => {
  const completedCount = tasks.value.filter((task) => task.isCompleted).length;
  const activeCount = tasks.value.length - completedCount;

  return allTabs.map((tab) => {
    if (tab.key === 'completed') {
      return { ...tab, count: completedCount };
    }

    if (tab.key === 'active') {
      return { ...tab, count: activeCount };
    }

    return { ...tab, count: tasks.value.length };
  });
});
</script>

<style scoped lang="scss">
.task-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  // padding: 24px;
}
</style>
