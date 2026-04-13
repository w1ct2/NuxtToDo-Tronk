<!-- Страница входа -->
<template>
  <section class="login">
    <div class="login__tabs" role="tablist" aria-label="Переключение формы авторизации"> <!-- Табы для переключения формы авторизации -->
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

    <form class="login__form" novalidate @submit.prevent="submitAuth"> <!-- Форма для входа -->
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
import AppButton from '~/components/UI/AppButton.vue';
import AppInput from '~/components/UI/AppInput.vue';

definePageMeta({
    layout: 'auth',
    middleware: 'is-auth',
})
const { login, register } = useAuth()

type AuthTab = 'login' | 'register'

const authTab = ref<AuthTab>('login') // Активный таб

const userEmail = ref('')
const userPassword = ref('')
const userPasswordConfirm = ref('')
const isSubmitting = ref(false)
// ^ Активные поля формы ^

const apiError = ref('')
// ^ Ошибка API ^

const validation = useValidation( // валидация формы
    () => ({
        userEmail: userEmail.value,
        userPassword: userPassword.value,
        userPasswordConfirm: userPasswordConfirm.value,
    }),
    {
        userEmail: [
            validators.required('Введите email'),
            validators.email('Введите корректный email'),
        ],
        userPassword: [
            validators.required('Введите пароль'),
            validators.minLength(6, 'Пароль должен быть минимум 6 символов'),
        ],
        userPasswordConfirm: [
            {
                name: 'passwordConfirm',
                test: (value, ctx) => { // проверка совпадения паролей
                    if (authTab.value === 'login') return null // если таб входа то не проверяем
                    if (!value) return 'Повторите пароль'
                    return value === ctx.form.userPassword ? null : 'Пароли не совпадают'
                },
            },
        ],
    },
)

const emailError = computed(() => validation.errors.value.userEmail ?? '')
const passwordError = computed(() => validation.errors.value.userPassword ?? '')
const passwordConfirmError = computed(() => validation.errors.value.userPasswordConfirm ?? '')
// ^ Ошибки валидации ^

const pageTitle = computed(() => authTab.value === 'login' ? 'Вход' : 'Регистрация') 
const pageSubtitle = computed(() => authTab.value === 'login' ? 'Для быстрого входа: admin@admin.admin, 12121212' : 'Создайте аккаунт и начните работать с задачами') 
const submitButtonText = computed(() => authTab.value === 'login' ? 'Войти' : 'Зарегистрироваться') 
// ^ Тексты страницы ^

const switchTab = (tab: AuthTab) => { // Переключение таба
    if (authTab.value === tab) {
        return
    }
    authTab.value = tab
    apiError.value = ''
    validation.reset()
    if (tab === 'login') {
        userPasswordConfirm.value = ''
    }
}

const getApiErrorMessage = (error: unknown) => { // Хэндлер ошибок входа
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message 
    if (typeof message === 'string' && message.trim()) {
        return message
    }

    return authTab.value === 'login'
        ? 'Неверный email или пароль'
        : 'Не удалось зарегистрироваться'
}

const submitAuth = async () => { // Хэндлер авторизации / регистрации 
    apiError.value = ''

    if (!(await validation.validateAll())) { // Если поля не проходят валидацию - завершить
        return
    }

    isSubmitting.value = true

    try {
        if (authTab.value === 'login') { // Авторизация по имейлу и паролю
            await login(userEmail.value, userPassword.value)
            return
        }

        await register(userEmail.value, userPassword.value) // Регистрация и
        await login(userEmail.value, userPassword.value) // Последующий сразу вход по этим данным
    } catch (error) {
        apiError.value = getApiErrorMessage(error) // Хэндлер ошибок входа
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
