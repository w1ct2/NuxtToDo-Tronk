import axios from "axios"

export default defineNuxtPlugin(()=> {
    const config = useRuntimeConfig()

    const api = axios.create({ // Создание axios экземпляра
        baseURL: config.public.apiBase // Базовый url для api
    })

    api.interceptors.request.use((config)=> { // Перехватчик запросов
        const token = import.meta.client ? localStorage.getItem('token') : null

        if (token) { // Добавление токена в заголовок
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    })

    api.interceptors.response.use( // Перехватчик ответов
        (res)=> res,
        (err) => {
            if (err.response?.status === 401 && import.meta.client) { // Удаление токена при 401 ошибке
                localStorage.removeItem('token')
                navigateTo('/login') // Перенаправление на страницу входа
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
