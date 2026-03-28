<template>
  <Teleport to="body">
    <Transition name="app-popup">
      <div
        v-if="modelValue"
        class="app-popup"
        :style="popupVars"
        @click="onOverlayClick"
      >
        <div
          class="app-popup__content"
          :class="[{ 'is-no-padding': noPadding }, contentClass]"
          @click.stop
        >
          <button
            v-if="showClose"
            type="button"
            class="app-popup__close"
            @click="closePopup"
          >
            x
          </button>

          <header v-if="$slots.header || title" class="app-popup__header">
            <slot name="header">
              <h3 class="app-popup__title">{{ title }}</h3>
            </slot>
          </header>

          <div class="app-popup__body">
            <slot />
          </div>

          <footer v-if="$slots.footer" class="app-popup__footer">
            <slot name="footer" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'

let openedPopups = 0

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  maxWidth: { type: String, default: '560px' },
  zIndex: { type: Number, default: 1200 },
  showClose: { type: Boolean, default: true },
  closeOnOverlay: { type: Boolean, default: true },
  closeOnEsc: { type: Boolean, default: true },
  lockScroll: { type: Boolean, default: true },
  noPadding: { type: Boolean, default: false },
  contentClass: { type: String, default: '' },
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'open'): void
  (e: 'close'): void
}>()

const popupVars = computed(() => ({
  '--app-popup-max-width': props.maxWidth,
  '--app-popup-z-index': String(props.zIndex),
}))

const syncBodyScrollLock = () => {
  if (!import.meta.client) {
    return
  }

  document.body.classList.toggle('is-popup-open', openedPopups > 0)
}

const closePopup = () => {
  emit('update:modelValue', false)
  emit('close')
}

const onOverlayClick = () => {
  if (props.closeOnOverlay) {
    closePopup()
  }
}

const onDocumentKeydown = (event: KeyboardEvent) => {
  if (!props.modelValue || !props.closeOnEsc || event.defaultPrevented) {
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    closePopup()
  }
}

watch(
  () => props.modelValue,
  (isOpen, wasOpen = false) => {
    if (!import.meta.client) {
      return
    }

    if (props.lockScroll) {
      if (isOpen && !wasOpen) {
        openedPopups += 1
      } else if (!isOpen && wasOpen) {
        openedPopups = Math.max(0, openedPopups - 1)
      }
      syncBodyScrollLock()
    }

    if (isOpen && props.closeOnEsc) {
      document.addEventListener('keydown', onDocumentKeydown)
    } else {
      document.removeEventListener('keydown', onDocumentKeydown)
    }

    if (isOpen && !wasOpen) {
      emit('open')
    }
  },
  { immediate: true },
)

watch(
  () => props.closeOnEsc,
  (isEnabled) => {
    if (!import.meta.client || !props.modelValue) {
      return
    }

    if (isEnabled) {
      document.addEventListener('keydown', onDocumentKeydown)
    } else {
      document.removeEventListener('keydown', onDocumentKeydown)
    }
  },
)

watch(
  () => props.lockScroll,
  (isEnabled, wasEnabled = false) => {
    if (!import.meta.client || props.modelValue === false) {
      return
    }

    if (isEnabled && !wasEnabled) {
      openedPopups += 1
      syncBodyScrollLock()
    } else if (!isEnabled && wasEnabled) {
      openedPopups = Math.max(0, openedPopups - 1)
      syncBodyScrollLock()
    }
  },
)

onBeforeUnmount(() => {
  if (!import.meta.client) {
    return
  }

  document.removeEventListener('keydown', onDocumentKeydown)

  if (props.modelValue && props.lockScroll) {
    openedPopups = Math.max(0, openedPopups - 1)
    syncBodyScrollLock()
  }
})
</script>

<style scoped lang="scss">
:global(body.is-popup-open) {
  overflow: hidden;
}

.app-popup {
  position: fixed;
  inset: 0;
  z-index: var(--app-popup-z-index, 1200);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: var(--app-popup-overlay-bg, rgba(8, 6, 13, 0.45));
  backdrop-filter: blur(2px);
}

.app-popup__content {
  width: min(100%, var(--app-popup-max-width, 560px));
  max-height: auto;
  height: auto;
  padding: var(--app-popup-padding, 24px);
  border: 1px solid var(--border);
  border-radius: var(--app-popup-radius, 16px);
  background: var(--bg);
  box-shadow: var(--shadow);
  color: var(--text);
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.app-popup__content.is-no-padding {
  padding: 0;
}

.app-popup__close {
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-h);
  cursor: pointer;
  line-height: 1;
}

.app-popup__header {
  display: flex;
  align-items: center;
  padding-right: 40px;
}

.app-popup__title {
  margin: 0;
  color: var(--text-h);
  font-size: 24px;
  line-height: 1.2;
}

.app-popup__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.app-popup__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: auto;
}

.app-popup-enter-active,
.app-popup-leave-active {
  transition: opacity 0.2s ease;
}

.app-popup-enter-active .app-popup__content,
.app-popup-leave-active .app-popup__content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.app-popup-enter-from,
.app-popup-leave-to {
  opacity: 0;
}

.app-popup-enter-from .app-popup__content,
.app-popup-leave-to .app-popup__content {
  transform: translateY(10px) scale(0.98);
  opacity: 0.85;
}

@media (prefers-color-scheme: dark) {
  .app-popup {
    background: var(--app-popup-overlay-bg, rgba(5, 6, 10, 0.65));
  }
}

@media (max-width: 768px) {
  .app-popup {
    padding: 12px;
  }

  .app-popup__content {
    max-height: calc(100svh - 24px);
    padding: var(--app-popup-padding-mobile, 16px);
  }

  .app-popup__title {
    font-size: 20px;
  }
}
</style>
