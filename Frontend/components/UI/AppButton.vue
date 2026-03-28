<template>
  <button
    class="app-button"
    :class="[
      `is-${variant}`,
      `is-${size}`,
      {
        'is-block': block,
        'is-loading': loading,
      },
    ]"
    :type="type"
    :disabled="disabled || loading"
    :aria-busy="loading ? 'true' : undefined"
    v-bind="$attrs"
    @click="emit('click', $event)"
  >
    <span v-if="$slots.left" class="app-button__slot app-button__slot--left">
      <slot name="left" />
    </span>

    <span v-if="loading" class="app-button__spinner" aria-hidden="true" />

    <span class="app-button__label">
      <slot>{{ label }}</slot>
    </span>

    <span v-if="$slots.right" class="app-button__slot app-button__slot--right">
      <slot name="right" />
    </span>
  </button>
</template>

<script lang="ts" setup>
type ButtonType = 'button' | 'submit' | 'reset'
type ButtonVariant = 'primary' | 'secondary' | 'ghost'
type ButtonSize = 'sm' | 'md' | 'lg'

defineProps({
  type: { type: String as () => ButtonType, default: 'button' as ButtonType },
  variant: { type: String as () => ButtonVariant, default: 'secondary' as ButtonVariant },
  size: { type: String as () => ButtonSize, default: 'md' as ButtonSize },
  label: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  loading: { type: Boolean, default: false },
  block: { type: Boolean, default: false },
})

const emit = defineEmits(['click'])
</script>

<style scoped>
.app-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 120px;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text-h);
  font: inherit;
  font-weight: 500;
  line-height: 1;
  cursor: pointer;
  transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease, color 120ms ease;
}

.app-button:hover:not(:disabled) {
  border-color: var(--accent-border);
  background: var(--accent-=bg);
}

.app-button:focus-visible {
  outline: none;
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.app-button:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.app-button.is-block {
  width: 100%;
}

.app-button.is-sm {
  min-width: 96px;
  height: 36px;
  border-radius: 10px;
  padding: 0 12px;
  font-size: 14px;
}

.app-button.is-md {
  height: 44px;
  font-size: 15px;
}

.app-button.is-lg {
  min-width: 140px;
  height: 50px;
  border-radius: 14px;
  padding: 0 18px;
  font-size: 16px;
}

.app-button.is-primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.app-button.is-primary:hover:not(:disabled) {
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.app-button.is-secondary {
  background: var(--bg);
  border-color: var(--border);
  color: var(--text-h);
}

.app-button.is-ghost {
  background: transparent;
  border-color: transparent;
  color: var(--text-h);
}

.app-button__slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: inherit;
}

.app-button__slot :deep(svg),
.app-button__slot :deep(img) {
  width: 18px;
  height: 18px;
}

.app-button__label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
}

.app-button__spinner {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 2px solid currentColor;
  border-right-color: transparent;
  animation: app-button-spin 700ms linear infinite;
}

@keyframes app-button-spin {
  to {
    transform: rotate(360deg);
  }
}

</style>
