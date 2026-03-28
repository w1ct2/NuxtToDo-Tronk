<template>
  <section class="task-page">
    <nav class="task-page__header">
      <TaskTabs
        :tabs="tabsWithCounts"
        :active-tab="activeTab"
        @change="(value) => (activeTab = value)"
      />
    </nav>

    <TaskList :tasks="filteredTasks" @delete-task="handleTaskDelete" />
  </section>
</template>

<script setup lang="ts">
import TaskList from '~/components/pages/index/TaskList.vue';
import TaskTabs from '~/components/pages/index/TaskTabs.vue';
import type { TaskFilter, TaskTab, TodoTask } from '~/components/pages/index/types';

definePageMeta({
  middleware: 'is-auth',
});

const {getTasks} = useTasks()
const loadTasks = async () => {
  tasks.value = await getTasks(activeTab.value, searchQuery.value)
}
const activeTab = ref<TaskFilter>('all');
const searchQuery = ref('')

const tasks = ref<TodoTask[]>([]);

const handleTaskDelete = (taskId: number) => {
  tasks.value = tasks.value.filter((task) => task.id !== taskId);
};

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
  await loadTasks()
  console.log(tasks.value)
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
