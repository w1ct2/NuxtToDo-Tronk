import axios from "axios"

export default defineNuxtPlugin(()=> {
    const api = axios.create({
        baseURL: '/api'
    })

    api.interceptors.request.use((config)=> {
        const token = import.meta.client ? localStorage.getItem('token') : null

        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    })

    api.interceptors.response.use(
        (res)=> res,
        (err) => {
            if (err.response?.status === 401 && import.meta.client) {
                localStorage.removeItem('token')
                navigateTo('/login')
            }
            return Promise.reject(err)
        }
    )

    return {
        provide: {
            api,
        },
    }
}) 
