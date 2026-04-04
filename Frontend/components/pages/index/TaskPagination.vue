<template>
  <div class="task-pagination">
    <button
      type="button"
      class="task-pagination__button"
      :disabled="isPrevDisabled"
      @click="goToPage(page - 1)"
    >
      Пред.
    </button>

    <div class="task-pagination__info">
      <span class="task-pagination__pages">
        Страница {{ page }} из {{ totalPages }}
      </span>
      <span class="task-pagination__meta">
        Всего {{ total }} задач · {{ limit }} на странице
      </span>
    </div>

    <button
      type="button"
      class="task-pagination__button"
      :disabled="isNextDisabled"
      @click="goToPage(page + 1)"
    >
      След.
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  page: {
    type: Number,
    default: 1,
  },
  totalPages: {
    type: Number,
    default: 1,
  },
  total: {
    type: Number,
    default: 0,
  },
  limit: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['change-page'])

const isPrevDisabled = computed(() => props.page <= 1)
const isNextDisabled = computed(() => props.page >= Math.max(props.totalPages, 1))

const goToPage = (targetPage: number) => {
  if (targetPage < 1 || targetPage > props.totalPages || targetPage === props.page) {
    return
  }

  emit('change-page', targetPage)
}
</script>

<style scoped lang="scss">
.task-pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--text);
  font-size: 14px;
}

.task-pagination__button {
  border: 1px solid transparent;
  border-radius: 10px;
  padding: 6px 18px;
  font: inherit;
  cursor: pointer;
  color: var(--text);
  background: var(--bg);
  transition: border-color 0.2s ease, color 0.2s ease, background 0.2s ease;
}

.task-pagination__button:hover:not(:disabled) {
  border-color: var(--accent-border);
  color: var(--text-h);
}

.task-pagination__button:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}

.task-pagination__info {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.task-pagination__pages {
  font-weight: 600;
  color: var(--text-h);
}

.task-pagination__meta {
  font-size: 12px;
  color: var(--text);
}

@media (max-width: 640px) {
  .task-pagination {
    flex-direction: column;
  }

  .task-pagination__button {
    width: 100%;
  }
}
</style>
