<template>
  <div class="app-input">
    <label v-if="label" :for="id" class="app-input__label">
      {{ label }}
    </label>

    <div
      class="app-input__control"
      :class="{
        'is-disabled': disabled,
        'has-error': Boolean(error),
      }"
    >
      <span v-if="$slots.left" class="app-input__slot app-input__slot--left">
        <slot name="left" />
      </span>

      <input
        v-if="as === 'input'"
        :id="id"
        class="app-input__field"
        :type="type"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :value="modelValue === null ? '' : modelValue"
        :aria-invalid="Boolean(error) ? 'true' : 'false'"
        :aria-describedby="error && id ? id + '--error' : undefined"
        v-bind="$attrs"
        @input="onInput"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />

      <textarea
        v-else
        :id="id"
        class="app-input__field app-input__field--textarea"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :rows="rows"
        :value="modelValue === null ? '' : modelValue"
        :aria-invalid="Boolean(error) ? 'true' : 'false'"
        :aria-describedby="error && id ? id + '--error' : undefined"
        v-bind="$attrs"
        @input="onInput"
        @blur="$emit('blur')"
        @focus="$emit('focus')"
      />

      <span v-if="$slots.right" class="app-input__slot app-input__slot--right">
        <slot name="right" />
      </span>
    </div>

    <p v-if="error" :id="id ? id + '--error' : undefined" class="app-input__error">
      {{ error }}
    </p>
  </div>
</template>

<script lang="ts" setup>
type InputType = HTMLInputElement['type']
type InputMode =
  | 'text'
  | 'email'
  | 'search'
  | 'tel'
  | 'url'
  | 'none'
  | 'numeric'
  | 'decimal'

const props = defineProps({
  modelValue: { type: [String, Number], default: null },
  as: { type: String, default: 'input' }, // 'input' | 'textarea'
  type: { type: String as () => InputType, default: 'text' as InputType }, 
  label: { type: String, default: undefined },
  placeholder: { type: String, default: '' },
  name: { type: String, default: undefined },
  id: { type: String, default: undefined },
  autocomplete: { type: String, default: undefined },
  inputmode: { type: String as () => InputMode, default: undefined },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: undefined },
  rows: { type: Number, default: 3 },
  valueAsNumber: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

function onInput(e: Event) {
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  const raw = target.value

  const shouldCastNumber = props.type === 'number' || props.valueAsNumber

  if (shouldCastNumber) {
    if (raw === '') {
      emit('update:modelValue', null)
      return
    }
    const num = Number(raw)
    emit('update:modelValue', Number.isNaN(num) ? raw : num)
    return
  }

  emit('update:modelValue', raw)
}
</script>

<style scoped>
.app-input {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.app-input__label {
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  color: var(--text-h);
  font-size: 14px;
}

.app-input__required {
  color: var(--accent);
}

.app-input__control {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 12px;
  min-height: 44px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg);
  transition: border-color 120ms ease, box-shadow 120ms ease, background 120ms ease;
}

.app-input__control.has-error {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.app-input__control:focus-within {
  border-color: var(--accent-border);
  box-shadow: 0 0 0 3px var(--accent-bg);
}

.app-input__control.is-disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

.app-input__field {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  padding: 0;
  margin: 0;
  color: var(--text);
  font: inherit;
}

.app-input__field::placeholder {
  color: rgba(107, 99, 117, 0.65);
}

.app-input__slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
}

.app-input__slot :deep(svg),
.app-input__slot :deep(img) {
  width: 18px;
  height: 18px;
}

.app-input__field--textarea {
  height: auto;
  min-height: 110px;
  padding: 10px 0;
  resize: vertical;
}

.app-input__error {
  margin: 0;
  color: var(--accent);
  font-size: 12px;
  line-height: 1.2;
}
</style>
