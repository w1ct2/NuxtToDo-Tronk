import { computed, ref } from "vue"
import type { AxiosError, AxiosRequestConfig, Method } from "axios"

// статусы жизненного цикла запроса
type RequestLifecycleStatus = "idle" | "loading" | "success" | "error"

// опции запроса
type ApiRequestOptions = {
    url?: string
    method?: Method // методы запроса axios
    headers?: Record<string, string>
    body?: unknown
    params?: Record<string, unknown>
    immediate?: boolean
    initialData?: unknown
}

// получение сообщения об ошибке
const getErrorMessage = (error: unknown): string => {
    const axiosError = error as AxiosError<{ message?: string }> 
    const responseMessage = axiosError.response?.data?.message // сообщение об ошибке из ответа
    if (responseMessage) return responseMessage
    if (error instanceof Error) return error.message
    return "Неизвестная ошибка запроса" // стандартное соо о ошибке
}

export const useApiRequest = <TResponse = unknown>(initialOptions: ApiRequestOptions = {}) => {
    const { $api } = useNuxtApp() // получение экземпляра axios

    const data = ref<TResponse | null>((initialOptions.initialData as TResponse) ?? null)
    const status = ref<number | null>(null)
    const lifecycleStatus = ref<RequestLifecycleStatus>("idle")
    const error = ref<string | null>(null)

    const isLoading = computed(() => lifecycleStatus.value === "loading")
    const isSuccess = computed(() => lifecycleStatus.value === "success")
    const isError = computed(() => lifecycleStatus.value === "error")

    const execute = async (overrideOptions: ApiRequestOptions = {}) => {
        const resolvedUrl = overrideOptions.url ?? initialOptions.url
        if (!resolvedUrl) {
            throw new Error("URL обязателен для выполнения HTTP-запроса")
        }

        lifecycleStatus.value = "loading" // установка загрузки
        error.value = null // сброс состояния оошибки

        try {
            const config: AxiosRequestConfig = { // создание конфига под запрос
                url: resolvedUrl,
                method: overrideOptions.method ?? initialOptions.method ?? "GET", // по умолчанию get метод
                headers: {
                    ...(initialOptions.headers ?? {}),
                    ...(overrideOptions.headers ?? {}),
                },
                params: overrideOptions.params ?? initialOptions.params,
                data: overrideOptions.body ?? initialOptions.body,
            }

            const response = await $api.request<TResponse>(config)

            data.value = response.data
            status.value = response.status
            lifecycleStatus.value = "success"

            return response.data
        } catch (requestError) {
            const axiosError = requestError as AxiosError
            status.value = axiosError.response?.status ?? null
            error.value = getErrorMessage(requestError)
            lifecycleStatus.value = "error"
            throw requestError
        }
    }

    // сброс состояния запроса
    const reset = () => {
        data.value = (initialOptions.initialData as TResponse) ?? null
        status.value = null
        error.value = null
        lifecycleStatus.value = "idle"
    }

    if (initialOptions.immediate) {
        void execute()
    }

    return {
        data,
        status,
        lifecycleStatus,
        isLoading,
        isSuccess,
        isError,
        error,
        execute,
        reset,
    }
}
