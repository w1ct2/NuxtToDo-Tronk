<template>
  <div class="app-select">
    <div class="app-select__row">
      <label v-if="label" :for="id" class="app-select__label">
        {{ label }}
      </label>

      <div
        class="app-select__control"
        :class="{
          'has-error': Boolean(error),
          'is-disabled': disabled,
        }"
      >
        <select
          :id="id"
          class="app-select__field"
          :name="name"
          :disabled="disabled"
          :value="selectedValue"
          :aria-invalid="Boolean(error) ? 'true' : 'false'"
          v-bind="$attrs"
          @change="onChange"
        >
          <option
            v-for="option in normalizedOptions"
            :key="option.valueKey"
            :value="option.valueKey"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </select>

        <span class="app-select__arrow" aria-hidden="true">v</span>
      </div>
    </div>

    <p v-if="error" class="app-select__error">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type SelectPrimitive = string | number
type SelectOption =
  | SelectPrimitive
  | {
      label: string
      value: SelectPrimitive
      disabled?: boolean
    }

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  options: { type: Array as () => SelectOption[], default: () => [] },
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  id: { type: String, default: undefined },
  name: { type: String, default: undefined },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: SelectPrimitive | null): void
  (e: 'change', value: SelectPrimitive | null): void
}>()

const normalizedOptions = computed(() =>
  props.options.map((option) => {
    if (typeof option === 'object') {
      return {
        label: option.label,
        value: option.value,
        valueKey: String(option.value),
        disabled: Boolean(option.disabled),
      }
    }

    return {
      label: String(option),
      value: option,
      valueKey: String(option),
      disabled: false,
    }
  }),
)

const selectedValue = computed(() =>
  props.modelValue === null || props.modelValue === undefined
    ? ''
    : String(props.modelValue),
)

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const valueKey = target.value

  if (!valueKey) {
    emit('update:modelValue', null)
    emit('change', null)
    return
  }

  const selectedOption = normalizedOptions.value.find((option) => option.valueKey === valueKey)
  const nextValue = selectedOption ? selectedOption.value : valueKey

  emit('update:modelValue', nextValue)
  emit('change', nextValue)
}
</script>

<style scoped lang="scss">
.app-select {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.app-select__row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.app-select__label {
  color: var(--text-h);
  font-size: 14px;
  white-space: nowrap;
}

.app-select__control {
  position: relative;
  flex: 1;
  min-width: 0;
}

.app-select__field {
  appearance: none;
  width: 100%;
  height: 44px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  padding: 0 36px 0 12px;
  outline: none;
  transition: border-color 120ms ease, box-shadow 120ms ease;
  cursor: pointer;
}

.app-select__field:focus {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.app-select__control.has-error .app-select__field {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.app-select__control.is-disabled .app-select__field {
  opacity: 0.65;
  cursor: not-allowed;
}

.app-select__arrow {
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  color: var(--text);
  pointer-events: none;
  font-size: 12px;
  line-height: 1;
}

.app-select__error {
  margin: 0;
  color: var(--accent);
  font-size: 12px;
  line-height: 1.2;
}
</style>
