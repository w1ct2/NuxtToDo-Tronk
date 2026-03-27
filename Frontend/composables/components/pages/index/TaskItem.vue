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
        <button type="button" class="task-row__action">Редакт.</button>
        <button type="button" class="task-row__action">Удалить</button>
      </div>

      <p class="task-row__author">{{ task.createdBy }}</p>

      <time class="task-row__date" :datetime="task.dueDate">{{ formattedDate }}</time>

      <span class="task-row__priority" :class="`is-${task.priority}`">{{ priorityLabel }}</span>

      <div class="task-row__title-wrap">
        <span class="task-row__id">#{{ task.id }}</span>
        <p class="task-row__title">{{ task.title }}</p>
      </div>

      <label class="task-row__checkbox" aria-label="Статус выполнения">
        <input type="checkbox" :checked="task.isCompleted" disabled>
      </label>
    </div>

    <transition name="task-desc">
      <div v-if="isExpanded" class="task-row__description">
        {{ task.description }}
      </div>
    </transition>
  </li>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PropType } from 'vue';
import type { TodoTask } from './types';

const props = defineProps({
  task: {
    type: Object as PropType<TodoTask>,
    required: true,
  },
});

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

const formattedDate = computed(() => {
  const date = new Date(props.task.dueDate);

  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
});
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
