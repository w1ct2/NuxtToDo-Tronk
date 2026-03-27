<template>
    <section class="login">  
        <h1 class="login__title">Login</h1>
        <p class="login__p">Управляйте задачами эффективно</p>
        <form class="login__form" novalidate @submit.prevent="loginValidator">
            <AppInput
                v-model="userEmail"
                label='Email'
                placeholder='xxxxxx@xxx.xx'
                type="email"
                autocomplete="email"
                :error="emailError">
            </AppInput>
            <AppInput
                v-model="userPassword"
                label='Password'
                placeholder='xxxxxx'
                type="password"
                autocomplete="current-password"
                :error="passwordError">
            </AppInput>
            <AppButton class="login__btn" type="submit" variant="primary">Войти</AppButton>
        </form>
    </section>
</template>

<script setup lang="ts">
import AppButton from '~/components/UI/AppButton.vue';
import AppInput from '~/components/UI/AppInput.vue';

const userEmail = ref('')
const userPassword = ref('')

const emailError = ref('')
const passwordError = ref('')

const validateLoginForm = () => {
    emailError.value = ''
    passwordError.value = ''

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

    return !emailError.value && !passwordError.value
}

const loginValidator = () => {
    if (!validateLoginForm()) {
        return
    }

    // Тут можно вызвать API авторизации
    console.log('Форма валидна:', {
        email: userEmail.value.trim(),
        passwordLength: userPassword.value.length,
    })
}
</script>

<style lang="scss" scoped>
.login {
    display: flex;
    flex-direction: column;
    align-items: center;
    &__p {
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
}
</style>
