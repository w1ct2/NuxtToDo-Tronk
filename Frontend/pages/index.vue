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
import type { TaskFilter, TaskTab } from '~/components/pages/index/types';

definePageMeta({
  middleware: 'is-auth',
});

const { tasks, loadTasks: loadTasksFromServer } = useTasks()
const loadPageTasks = async () => {
  await loadTasksFromServer(activeTab.value, searchQuery.value)
}
const activeTab = ref<TaskFilter>('all');
const searchQuery = ref('')

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

onMounted(async()=>{
  await loadPageTasks()
})
</script>

<style scoped lang="scss">
.task-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
  // padding: 24px;
}
</style>
