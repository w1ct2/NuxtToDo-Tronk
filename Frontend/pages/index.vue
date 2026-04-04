<!-- Основная страница, список задач -->
<template>
  <section class="task-page">
    <!-- Секция настройки листа, фильтрация/ поиск/ сортировка -->
    <nav class="task-page__header">
      <!-- Фильтрация (Все/ Активные / Выполненные) -->
      <TaskTabs
        :tabs="allTabs"
        :active-tab="activeTab"
        @change="(value) => (activeTab = value)"
      />
      <!-- Поиск по заголовку/ описанию /автору -->
      <AppInput placeholder="Поиск" type="text" class="task-page__search" v-model="searchQuery"></AppInput>
      <!-- Выбор сортировки (Автор, приоритет, дата, название)-->
      <AppSelect 
        class="task-page__select"
        :options="sortOptions"
        v-model="sortQuery" 
      />
    </nav>
    <TaskList :tasks="tasks" />
    <div class="task-page__pagination" v-if="isPaginated">
      <TaskPagination
        :page="meta.page"
        :total-pages="meta.totalPages"
        :total="meta.total"
        :limit="meta.limit"
        @change-page="handlePageChange"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import TaskList from '~/components/pages/index/TaskList.vue';
import TaskTabs from '~/components/pages/index/TaskTabs.vue';
import TaskPagination from '~/components/pages/index/TaskPagination.vue';
import type { TaskFilter, TaskSort, TaskTab } from '~/components/pages/index/types';
import AppInput from '~/components/UI/AppInput.vue';
import AppSelect from '~/components/UI/AppSelect.vue';
import useDebounce from '~/composables/useDebounce';
definePageMeta({
  middleware: 'is-auth', // Мидлвэйр для проверки авторизации
});
const activeTab = ref<TaskFilter>('all'); // Активный таб
const isPaginated = computed(() => activeTab.value === 'all') // Проверка нужна ли пагинация. Фильтр Все - нужна, в остальном случае нет
const allTabs: TaskTab[] = [ // Опции табов
    { key: 'all', label: 'Все задачи' },
    { key: 'completed', label: 'Выполненные' },
    { key: 'active', label: 'Активные' },
];

const { tasks, meta, loadTasks: loadTasksFromServer } = useTasks()
const loadPageTasks = async (
  status: TaskFilter,
  search: string,
  sortQuery: TaskSort,
  page = 1,
) => { // Подгрузка задач с сервера
  const enablePagination = isPaginated.value
  const requestedPage = enablePagination ? page : 1
  await loadTasksFromServer(status, search, sortQuery, enablePagination, requestedPage)
}

const sortQuery = ref<TaskSort>('name') // Дефолтный способ сортировки
const sortOptions = [ // Опции сортировки
  { label: 'По названию', value: 'name' },
  { label: 'По автору', value: 'author' },
  { label: 'По приоритету', value: 'priority' },
  { label: 'По сроку', value: 'date' },
]
const searchQuery = ref('') // Поисковой запрос
const debouncedSearchQuery = ref('') // Поисковой запрос с обновлением через задержку
const applySearchDebounce = useDebounce((value: string) => { // Хэндлер обновления debouncedSearchQuery
  debouncedSearchQuery.value = value
}, 300)
const handlePageChange = async (page: number) => {
  if (!isPaginated.value) {
    return
  }

  await loadPageTasks(activeTab.value, debouncedSearchQuery.value, sortQuery.value, page)
}

watch(
  activeTab,
  async (value) => {
    await loadPageTasks(value, debouncedSearchQuery.value, sortQuery.value, 1)
  },
  {immediate:true}
)
watch( // При обновлении searchQuery включается хэндлер с задержкой
  searchQuery,
  (value) => {
    applySearchDebounce(value)
  },
  { immediate: true },
)
watch(
  debouncedSearchQuery, 
  async (value) => {
    await loadPageTasks(activeTab.value, value, sortQuery.value, 1)
  },
  {immediate:true}
)
watch(
  sortQuery, 
  async (value) => {
    await loadPageTasks(activeTab.value, debouncedSearchQuery.value, value, 1)
  },
  {immediate:true}
)

onMounted(async()=>{
  await loadPageTasks(activeTab.value, debouncedSearchQuery.value, sortQuery.value, 1) // Подгрузка задач при монтировании
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
.task-page__pagination {
  width: 100%;
  display: flex;
  justify-content: center;
}
@media (max-width: 768px) {
  .task-page__header {
    flex-direction: column;
  }
  .task-page__select {
    margin-left: 0;
  }
}
</style>
