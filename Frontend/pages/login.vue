<template>
  <section class="login">
    <div class="login__tabs" role="tablist" aria-label="Переключение формы авторизации">
      <button
        type="button"
        class="login__tab-btn"
        :class="{ 'is-active': authTab === 'login' }"
        role="tab"
        :aria-selected="authTab === 'login'"
        @click="switchTab('login')"
      >
        Вход
      </button>
      <button
        type="button"
        class="login__tab-btn"
        :class="{ 'is-active': authTab === 'register' }"
        role="tab"
        :aria-selected="authTab === 'register'"
        @click="switchTab('register')"
      >
        Регистрация
      </button>
    </div>

    <h1 class="login__title">{{ pageTitle }}</h1>
    <p class="login__subtitle">{{ pageSubtitle }}</p>

    <form class="login__form" novalidate @submit.prevent="submitAuth">
      <AppInput
        v-model="userEmail"
        label="Email"
        placeholder="xxxxxx@xxx.xx"
        type="email"
        autocomplete="email"
        :error="emailError"
      />
      <AppInput
        v-model="userPassword"
        label="Password"
        placeholder="xxxxxx"
        type="password"
        :autocomplete="authTab === 'login' ? 'current-password' : 'new-password'"
        :error="passwordError"
      />
      <AppInput
        v-if="authTab === 'register'"
        v-model="userPasswordConfirm"
        label="Repeat password"
        placeholder="xxxxxx"
        type="password"
        autocomplete="new-password"
        :error="passwordConfirmError"
      />

      <AppButton
        class="login__btn"
        type="submit"
        variant="secondary"
        :loading="isSubmitting"
      >
        {{ submitButtonText }}
      </AppButton>

      <p v-if="apiError" class="login__error">{{ apiError }}</p>
    </form>
  </section>
</template>

<script setup lang="ts">
import AppButton from '~/composables/components/UI/AppButton.vue';
import AppInput from '~/composables/components/UI/AppInput.vue';

definePageMeta({
    layout: 'auth',
    middleware: 'is-auth',
})
const { login, register } = useAuth()

type AuthTab = 'login' | 'register'

const authTab = ref<AuthTab>('login')
const userEmail = ref('')
const userPassword = ref('')
const userPasswordConfirm = ref('')
const isSubmitting = ref(false)

const emailError = ref('')
const passwordError = ref('')
const passwordConfirmError = ref('')
const apiError = ref('')

const pageTitle = computed(() => authTab.value === 'login' ? 'Вход' : 'Регистрация')
const pageSubtitle = computed(() => authTab.value === 'login'
    ? 'Управляйте задачами эффективно'
    : 'Создайте аккаунт и начните работать с задачами'
)
const submitButtonText = computed(() => authTab.value === 'login' ? 'Войти' : 'Зарегистрироваться')

const clearFormErrors = () => {
    emailError.value = ''
    passwordError.value = ''
    passwordConfirmError.value = ''
}

const switchTab = (tab: AuthTab) => {
    if (authTab.value === tab) {
        return
    }

    authTab.value = tab
    apiError.value = ''
    clearFormErrors()

    if (tab === 'login') {
        userPasswordConfirm.value = ''
    }
}

const validateAuthForm = () => {
    clearFormErrors()

    const email = userEmail.value.trim()
    const password = userPassword.value
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (!email) {
        emailError.value = 'Введите email'
    } else if (!emailPattern.test(email)) {
        emailError.value = 'Введите корректный email'
    }

    if (!password) {
        passwordError.value = 'Введите пароль'
    } else if (password.length < 6) {
        passwordError.value = 'Пароль должен быть минимум 6 символов'
    }

    if (authTab.value === 'register') {
        if (!userPasswordConfirm.value) {
            passwordConfirmError.value = 'Повторите пароль'
        } else if (userPasswordConfirm.value !== password) {
            passwordConfirmError.value = 'Пароли не совпадают'
        }
    }

    return !emailError.value && !passwordError.value && !passwordConfirmError.value
}

const getApiErrorMessage = (error: unknown) => {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message
    if (typeof message === 'string' && message.trim()) {
        return message
    }

    return authTab.value === 'login'
        ? 'Неверный email или пароль'
        : 'Не удалось зарегистрироваться'
}

const submitAuth = async () => {
    apiError.value = ''

    if (!validateAuthForm()) {
        return
    }

    isSubmitting.value = true

    try {
        if (authTab.value === 'login') {
            await login(userEmail.value, userPassword.value)
            return
        }

        await register(userEmail.value, userPassword.value)
        await login(userEmail.value, userPassword.value)
    } catch (error) {
        apiError.value = getApiErrorMessage(error)
    } finally {
        isSubmitting.value = false
    }
}

</script>

<style lang="scss" scoped>
.login {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__tabs {
        width: 100%;
        max-width: 560px;
        margin-bottom: 20px;
        padding: 4px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--bg);
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 6px;
    }
    &__tab-btn {
        border: none;
        border-radius: 10px;
        height: 40px;
        font: inherit;
        color: var(--text);
        background: transparent;
        cursor: pointer;
        transition: background 0.2s ease, color 0.2s ease;
        &.is-active {
            background: var(--accent-bg);
            color: var(--text-h);
            font-weight: 600;
        }
    }
    &__subtitle {
        text-align: center;
        font-size: 20px;
    }
    &__form {
        max-width: 560px;
        width: 100%;
        margin-top: 30px;
        display: flex;
        flex-direction: column;
        gap: 15px;
    }
    &__btn {
        margin-top: 50px;
    }
    &__error {
        margin: 0;
        color: var(--accent);
        font-size: 14px;
        text-align: center;
    }
}
</style>
