<template>
  <header class="app-header">
    <nav class="app-header__nav">
      <h2>ToDo-Tronk</h2>
      <h3 class="app-header__h3">Мой список задач:</h3>
      <AppButton variant="secondary" style="margin-left: auto;" @click="isActivePopup = true">+ Добавить задачу</AppButton>
      <AppPopup v-model="isActivePopup" content-class="app-header__popup">
        <template #header>
          Добавить задачу
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
          <AppButton @click="onCreateNewTask">Добавить</AppButton>
        </template>
      </AppPopup>
    </nav>
  </header>
</template>

<script setup lang="ts">
import AppButton from '~/components/UI/AppButton.vue';
import AppPopup from '../UI/AppPopup.vue';
import AppInput from '../UI/AppInput.vue';
import AppSelect from '../UI/AppSelect.vue';
import type { TaskPriority } from '../pages/index/types';
const isActivePopup = ref(false)
const {createTask} = useTasks()

const author = ref('')
const authorError = ref('')
const title = ref('')
const titleError = ref('')
const description = ref('')
const descriptionError = ref('')
const taskDate = ref('')
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

const toIsoDate = (value: string) => {
  const [day = '', month = '', year = ''] = value.split('.')
  if (day.length !== 2 || month.length !== 2 || year.length !== 4) {
    return ''
  }

  return `${year}-${month}-${day}`
}

const onCreateNewTask = async () => {
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
    id: Date.now(),
    isCompleted: false,

    title: title.value,
    description: description.value,
    createdBy: author.value,
    priority: priority.value,
    dueDate: toIsoDate(taskDate.value),
  }

  await createTask(task)

  isActivePopup.value = false
}
</script>

<style lang="scss">
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

.app-header__popup {
  min-height: 500px;
}
</style>
