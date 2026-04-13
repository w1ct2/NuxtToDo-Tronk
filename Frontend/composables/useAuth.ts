export const useAuth = () => {
    const normalizeEmail = (email: string) => email.trim().toLowerCase() // Нормализация имейла

    // запрос авторизации
    const loginRequest = useApiRequest<{ token: string }>({
        url: "/auth/login",
        method: "POST",
    })
    // запрос регистрации
    const registerRequest = useApiRequest({
        url: "/auth/register",
        method: "POST",
    })
    // запрос проверки авторизации
    const checkAuthRequest = useApiRequest({
        url: "/auth/me",
        method: "GET",
    })

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
        const response = await loginRequest.execute({
            body: {
                email: normalizeEmail(email),
                password,
            },
        })
        setToken(response.token) // Установка токена в локалхост
        await navigateTo('/')
    }

    const register = async (email: string, password: string) => { // Запрос регистрации
        await registerRequest.execute({
            body: {
                email: normalizeEmail(email),
                password,
            },
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
            await checkAuthRequest.execute()
            return true
        } catch {
            clearToken()
            return false
        }
    }

    return { login, register, logout, checkAuth }
}
