<template>
  <section class="task-page">
    <nav class="task-page__header">
      <TaskTabs
        :tabs="tabsWithCounts"
        :active-tab="activeTab"
        @change="(value) => (activeTab = value)"
      />
      <AppInput placeholder="Поиск" type="text" class="task-page__search" v-model="searchQuery"></AppInput>
      <AppSelect 
        class="task-page__select"
        :options="sortOptions"
        v-model="sortQuery" 
      />
    </nav>
    <TaskList :tasks="sortedTasks" />
  </section>
</template>

<script setup lang="ts">
import TaskList from '~/components/pages/index/TaskList.vue';
import TaskTabs from '~/components/pages/index/TaskTabs.vue';
import type { TaskFilter, TaskPriority, TaskTab } from '~/components/pages/index/types';
import AppInput from '~/components/UI/AppInput.vue';
import AppSelect from '~/components/UI/AppSelect.vue';
import useDebounce from '~/composables/useDebounce';

definePageMeta({
  middleware: 'is-auth',
});

const { tasks, loadTasks: loadTasksFromServer } = useTasks()
const loadPageTasks = async () => {
  await loadTasksFromServer()
}
const activeTab = ref<TaskFilter>('all');
const searchQuery = ref('')
const debouncedSearchQuery = ref('')

type TaskSort = 'name' | 'author' | 'priority' | 'date';
const sortQuery = ref<TaskSort>('name')
const sortOptions = [
  { label: 'По названию', value: 'name' },
  { label: 'По автору', value: 'author' },
  { label: 'По приоритету', value: 'priority' },
  { label: 'По сроку', value: 'date' },
]

const applySearchDebounce = useDebounce((value: string) => {
  debouncedSearchQuery.value = value
}, 300)

watch(
  searchQuery,
  (value) => {
    applySearchDebounce(value)
  },
  { immediate: true },
)

const allTabs: TaskTab[] = [
  { key: 'all', label: 'Все задачи' },
  { key: 'completed', label: 'Выполненные' },
  { key: 'active', label: 'Активные' },
];

const filteredTasks = computed(() => {
  let statusFilteredTasks = tasks.value;

  if (activeTab.value === 'completed') {
    statusFilteredTasks = tasks.value.filter((task) => task.isCompleted);
  }

  if (activeTab.value === 'active') {
    statusFilteredTasks = tasks.value.filter((task) => !task.isCompleted);
  }

  const normalizedSearch = debouncedSearchQuery.value.trim().toLowerCase();
  if (!normalizedSearch) {
    return statusFilteredTasks;
  }

  return statusFilteredTasks.filter((task) => {
    const title = task.title.toLowerCase();
    const description = task.description.toLowerCase();
    const createdBy = task.createdBy.toLowerCase();

    return (
      title.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      createdBy.includes(normalizedSearch)
    );
  });
});

const priorityWeight: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

const toTaskTime = (value: string) => {
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(value)) {
    return new Date(`${value}T00:00:00`).getTime();
  }

  const ruPattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const ruMatch = value.match(ruPattern);
  if (ruMatch) {
    const [, day, month, year] = ruMatch;
    return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
  }

  return new Date(value).getTime();
}

const sortedTasks = computed(() => {
  const list = [...filteredTasks.value];

  if (sortQuery.value === 'name') {
    return list.sort((a, b) => a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' }));
  }

  if (sortQuery.value === 'author') {
    return list.sort((a, b) => a.createdBy.localeCompare(b.createdBy, 'ru', { sensitivity: 'base' }));
  }

  if (sortQuery.value === 'priority') {
    return list.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
  }

  if (sortQuery.value === 'date') {
    return list.sort((a, b) => {
      const leftTime = toTaskTime(a.dueDate);
      const rightTime = toTaskTime(b.dueDate);

      if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
        return 0;
      }

      if (Number.isNaN(leftTime)) {
        return 1;
      }

      if (Number.isNaN(rightTime)) {
        return -1;
      }

      return leftTime - rightTime;
    });
  }

  return list;
})

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
.task-page__header {
  display: flex;
  align-items: center;
  gap: 15px;
}
.task-page__search {
  max-width: 350px;
  width: 100%;
  height: 100%;
  margin-top: 15px;
}
.task-page__select {
  max-width: 160px;
  margin-top: 15px;
  margin-left: auto;
  margin-right: 15px;
}
</style>
