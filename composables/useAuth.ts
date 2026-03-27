export const useAuth = () => {
    const { $api } = useNuxtApp()
    const login = async (email: string, password: string) => {
        const res = await $api.post('/auth/login', { email, password})
        const token = res.data.token
        localStorage.setItem('token', token)
        navigateTo('/')
    }
    return { login }
}