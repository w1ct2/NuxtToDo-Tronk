<template>
  <li class="task-row" :class="{ 'is-completed': task.isCompleted }">
    <div class="task-row__main">
      <button
        type="button"
        class="task-row__expand"
        :aria-expanded="isExpanded"
        :aria-label="isExpanded ? 'Скрыть описание' : 'Показать описание'"
        @click="isExpanded = !isExpanded"
      >
        <span>{{ isExpanded ? '▾' : '▸' }}</span>
      </button>

      <div class="task-row__actions">
        <button type="button" class="task-row__action" @click="isActivePopup = true">Редакт.</button>
        <button type="button" class="task-row__action" @click="handleDelete">Удалить</button>
      </div>

      <p class="task-row__author">{{ task.createdBy }}</p>

      <time class="task-row__date" :datetime="dateTimeValue">{{ formattedDate }}</time>

      <span class="task-row__priority" :class="`is-${task.priority}`">{{ priorityLabel }}</span>

      <div class="task-row__title-wrap">
        <span class="task-row__id">#{{ task.id }}</span>
        <p class="task-row__title">{{ task.title }}</p>
      </div>

      <label class="task-row__checkbox" aria-label="Статус выполнения">
        <input type="checkbox" :checked="task.isCompleted" @click="updateIsCopleted">
      </label>
    </div>

    <transition name="task-desc">
      <div v-if="isExpanded" class="task-row__description">
        {{ task.description }}
      </div>
    </transition>

    <AppPopup v-model="isActivePopup" content-class="app-header__popup">
        <template #header>
          Редактировать задачу
        </template>
        <template #default>
          <AppInput
            placeholder="Автор задачи" 
            v-model="author"
            :error="authorError"
          />
          <AppInput 
            placeholder="Название задачи" 
            v-model="title"
            :error="titleError"
          />
          <AppInput 
            placeholder="Описание задачи" 
            v-model="description" 
            as="textarea" 
            style="height: 150px;"
            :error="descriptionError"
          />
          <AppSelect
            v-model="priority"
            label="Приоритет"
            :options="[
              { label: 'Средний', value: 'medium' },
              { label: 'Высокий', value: 'high' },
              { label: 'Низкий', value: 'low' }
            ]"
          />
          <AppInput
            v-model="taskDate"
            placeholder="xx.xx.xxxx"
            inputmode="numeric"
            maxlength="10"
            :error="taskDateError"
            @update:model-value="onTaskDateInput"
            @keydown="onTaskDateKeydown"
          >
            <template #left>Дата</template>
          </AppInput>
        </template>
        <template #footer>
          <AppButton @click="isActivePopup = false">Отмена</AppButton>
          <AppButton @click="onUpdateTask">Сохранить</AppButton>
        </template>
      </AppPopup>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppButton from '~/components/UI/AppButton.vue';
import AppPopup from '~/components/UI/AppPopup.vue';
import AppInput from '~/components/UI/AppInput.vue';
import AppSelect from '~/components/UI/AppSelect.vue';
import type { PropType } from 'vue';
import type { TaskPriority, TodoTask } from './types';

const isActivePopup = ref(false)

const props = defineProps({
  task: {
    type: Object as PropType<TodoTask>,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'deleted', id: number): void;
}>();

const {updateTask, deleteTask, loadTasks} = useTasks()

const isExpanded = ref(false);

const priorityLabel = computed(() => {
  if (props.task.priority === 'high') {
    return 'Высокий';
  }

  if (props.task.priority === 'medium') {
    return 'Средний';
  }

  return 'Низкий';
});

const parseTaskDate = (value: string) => {
  const isoPattern = /^\d{4}-\d{2}-\d{2}$/;
  if (isoPattern.test(value)) {
    const isoDate = new Date(`${value}T00:00:00`);
    return Number.isNaN(isoDate.getTime()) ? null : isoDate;
  }

  const ruPattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = value.match(ruPattern);
  if (match) {
    const [, day, month, year] = match;
    const ruDate = new Date(`${year}-${month}-${day}T00:00:00`);
    return Number.isNaN(ruDate.getTime()) ? null : ruDate;
  }

  const fallbackDate = new Date(value);
  return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
}

const formattedDate = computed(() => {
  const date = parseTaskDate(props.task.dueDate);
  if (!date) {
    return props.task.dueDate;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
});

const dateTimeValue = computed(() => {
  const date = parseTaskDate(props.task.dueDate);
  if (!date) {
    return undefined;
  }

  return date.toISOString().slice(0, 10);
});

const updateIsCopleted = async () => {
  await updateTask({
    ...props.task,
    isCompleted: !props.task.isCompleted,
  })
}

const handleDelete = async () => {
  await deleteTask(props.task);
  emit('deleted', props.task.id);
};
// Логика модалки редактирования
const author = ref(props.task.createdBy)
const authorError = ref('')
const title = ref(props.task.title)
const titleError = ref('')
const description = ref(props.task.description)
const descriptionError = ref('')
const taskDate = ref(props.task.dueDate)
const taskDateError = ref('')
const priority = ref<TaskPriority>('medium')

const allowedControlKeys = new Set([
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
])

const formatDateValue = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)

  return [day, month, year].filter(Boolean).join('.')
}

const toIsoDate = (value: string) => {
  const [day = '', month = '', year = ''] = value.split('.')
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return ''
  }

  return `${year}-${month}-${day}`
}

const validateTaskDate = (value: string) => {
  if (!value) {
    return ''
  }

  const [dayPart = '', monthPart = ''] = value.split('.')

  if (dayPart.length === 2) {
    const day = Number(dayPart)
    if (day < 1 || day > 31) {
      return 'День должен быть в диапазоне 01-31'
    }
  }

  if (monthPart.length === 2) {
    const month = Number(monthPart)
    if (month < 1 || month > 12) {
      return 'Месяц должен быть в диапазоне 01-12'
    }
  }

  return ''
}

const onTaskDateKeydown = (event: KeyboardEvent) => {
  if (event.metaKey || event.ctrlKey || event.altKey) {
    return
  }

  if (allowedControlKeys.has(event.key)) {
    return
  }

  if (!/^\d$/.test(event.key)) {
    event.preventDefault()
  }
}

const onTaskDateInput = (value: string | number | null) => {
  const formatted = formatDateValue(String(value ?? ''))
  taskDate.value = formatted
  taskDateError.value = validateTaskDate(formatted)
}

const toDisplayDate = (value: string) => {
  const isoMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!isoMatch) {
    return value
  }

  const [, year, month, day] = isoMatch
  return `${day}.${month}.${year}`
}

const onUpdateTask = async () => {
  authorError.value = ''
  titleError.value = ''
  descriptionError.value = ''
  taskDateError.value = validateTaskDate(taskDate.value)

  let hasError = false

  if (!author.value) {
    authorError.value = "Автор обязателен"
    hasError = true
  }
  if (!title.value) {
    titleError.value = "Название обязательно"
    hasError = true
  }
  if (!description.value) {
    descriptionError.value = "Описание обязательно"
    hasError = true
  }
  if (!taskDate.value || !/^\d{2}\.\d{2}\.\d{4}$/.test(taskDate.value) || taskDateError.value) {
    taskDateError.value = "Неправильная дата"
    hasError = true
  }

  if (hasError) {
    return
  }

  const task = {
    ...props.task,

    title: title.value,
    description: description.value,
    createdBy: author.value,
    priority: priority.value,
    dueDate: toIsoDate(taskDate.value),
  }

  await updateTask(task)

  isActivePopup.value = false
}
</script>

<style scoped lang="scss">
.task-row {
  border-bottom: 1px solid var(--border);
}

.task-row:last-child {
  border-bottom: none;
}

.task-row__main {
  display: grid;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  grid-template-columns: 34px minmax(200px, 1fr) 110px 130px 120px 172px 32px;
  grid-template-areas: "checkbox title priority date author actions expand";
}

.task-row__expand {
  grid-area: expand;
  width: 30px;
  height: 30px;
  padding: 0;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-h);
  cursor: pointer;
}

.task-row__actions {
  grid-area: actions;
  display: flex;
  gap: 8px;
}

.task-row__action {
  min-height: 30px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  padding: 0 10px;
  color: var(--text-h);
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}

.task-row__author {
  grid-area: author;
  font-size: 14px;
}

.task-row__date {
  grid-area: date;
  font-size: 14px;
}

.task-row__priority {
  grid-area: priority;
  width: fit-content;
  min-width: 80px;
  text-align: center;
  font-size: 12px;
  font-weight: 500;
  border-radius: 999px;
  padding: 5px 10px;
  border: 1px solid transparent;
}

.task-row__priority.is-high {
  color: #b91c1c;
  background: rgba(220, 38, 38, 0.12);
  border-color: rgba(220, 38, 38, 0.3);
}

.task-row__priority.is-medium {
  color: #b45309;
  background: rgba(245, 158, 11, 0.12);
  border-color: rgba(245, 158, 11, 0.3);
}

.task-row__priority.is-low {
  color: #166534;
  background: rgba(22, 163, 74, 0.12);
  border-color: rgba(22, 163, 74, 0.3);
}

.task-row__title-wrap {
  grid-area: title;
  display: flex;
  align-items: center;
  gap: 10px;
}

.task-row__id {
  font-size: 12px;
  color: var(--text);
  background: var(--code-bg);
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 2px 8px;
}

.task-row__title {
  color: var(--text-h);
  font-weight: 500;
}

.task-row__checkbox {
  grid-area: checkbox;
  width: 34px;
  display: flex;
  justify-content: flex-start;
}

.task-row__checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--accent);
}

.task-row.is-completed .task-row__title {
  opacity: 0.7;
  text-decoration: line-through;
}

.task-row__description {
  border-top: 1px solid var(--border);
  padding: 12px 16px 14px;
  font-size: 14px;
  line-height: 1.45;
}

.task-desc-enter-active,
.task-desc-leave-active {
  transition: max-height 0.2s ease, opacity 0.2s ease, transform 0.2s ease, padding 0.2s ease;
  overflow: hidden;
}

.task-desc-enter-from,
.task-desc-leave-to {
  max-height: 0;
  opacity: 0;
  transform: translateY(-6px);
  padding-top: 0;
  padding-bottom: 0;
}

.task-desc-enter-to,
.task-desc-leave-from {
  max-height: 120px;
  opacity: 1;
  transform: translateY(0);
}

@media (max-width: 1024px) {
  .task-row__main {
    grid-template-columns: auto 1fr;
    grid-template-areas:
      "checkbox title"
      "priority date"
      "author author"
      "actions actions"
      "expand expand";
    align-items: start;
  }

  .task-row__actions {
    flex-wrap: wrap;
  }

  .task-row__checkbox {
    justify-content: flex-start;
  }
}
</style>
