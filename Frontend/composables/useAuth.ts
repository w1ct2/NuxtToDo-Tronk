export const useAuth = () => {
    const { $api } = useNuxtApp()
    const normalizeEmail = (email: string) => email.trim().toLowerCase() // Нормализация имейла

    const setToken = (token: string) => { // Добавление токена в локалстор
        if (import.meta.client) {
            localStorage.setItem('token', token)
        }
    }

    const clearToken = () => { // Удаление токена из локалстор
        if (import.meta.client) {
            localStorage.removeItem('token')
        }
    }

    const login = async (email: string, password: string) => { // Запрос авторизации
        const res = await $api.post('/auth/login', {
            email: normalizeEmail(email),
            password,
        })
        setToken(res.data.token) // Установка токена в локалхост
        await navigateTo('/')
    }

    const register = async (email: string, password: string) => { // Запрос регистрации
        await $api.post('/auth/register', {
            email: normalizeEmail(email),
            password,
        })
        // setToken(res.data.token)
        // await navigateTo('/')
    }

    const logout = async () => { // Выход
        clearToken()
        await navigateTo('/login')
    }

    const checkAuth = async () => { // Проверка авторизации пользователя
        if (!import.meta.client) return false

        const token = localStorage.getItem('token')
        if (!token) return false

        try {
            await $api.get('/auth/me')
            return true
        } catch {
            clearToken()
            return false
        }
    }

    return { login, register, logout, checkAuth }
}
