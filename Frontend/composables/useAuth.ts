export const useAuth = () => {
    const { $api } = useNuxtApp()
    const normalizeEmail = (email: string) => email.trim().toLowerCase()

    const setToken = (token: string) => {
        if (import.meta.client) {
            localStorage.setItem('token', token)
        }
    }

    const clearToken = () => {
        if (import.meta.client) {
            localStorage.removeItem('token')
        }
    }

    const login = async (email: string, password: string) => {
        const res = await $api.post('/auth/login', {
            email: normalizeEmail(email),
            password,
        })
        setToken(res.data.token)
        await navigateTo('/')
    }

    const register = async (email: string, password: string) => {
        await $api.post('/auth/register', {
            email: normalizeEmail(email),
            password,
        })
    }

    const logout = async () => {
        clearToken()
        await navigateTo('/login')
    }

    const checkAuth = async () => {
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
