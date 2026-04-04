import type { TaskFilter, TaskSort, TodoTask } from "~/components/pages/index/types"

export const useTasks = () => {
    const { $api } = useNuxtApp()
    const tasks = useState<TodoTask[]>('tasks:list', () => [])
    const meta = useState<any>('tasks:meta', () => ({
        page: 1,
        limit: 3,
        total: 0,
        totalPages: 1,
    }))
    const lastRequest = useState('tasks:last-request', () => ({ // Обьект для занесения в память данных последнего запроса. без этого случаютсч баги с подгрузкой задач, слетает пагинация/отпадает реактивность
        status: 'all' as TaskFilter,
        search: '',
        sort: 'name' as TaskSort,
        isPagin: false,
        page: 1,
        limit: undefined as number | undefined,
    }))
    const isLoading = useState<boolean>('tasks:loading', () => false)
    const error = useState<string | null>('tasks:error', () => null)

    const loadTasks = async (
        status: TaskFilter = lastRequest.value.status,
        search = lastRequest.value.search,
        sort: TaskSort = lastRequest.value.sort,
        isPagin = lastRequest.value.isPagin,
        page = lastRequest.value.page,
        limit?: number
    ) => { // Функция подгрузки задач с сервера, сделана для поддержания реактивности при изменениях
        isLoading.value = true
        error.value = null

        try {
            // структура ответа от бэкенда
            type GetTasksResponse = {
                result: TodoTask[],
                page: number,
                limit: number,
                total: number,
                totalPages: number
            }

            const res = await $api.get<GetTasksResponse>('/tasks', {
                params: { status, search, sort, isPagin, page, limit: limit ?? lastRequest.value.limit },
            })

            tasks.value = res.data.result
            meta.value = res.data

            lastRequest.value = {
                status,
                search,
                sort,
                isPagin,
                page,
                limit: limit ?? lastRequest.value.limit,
            }

            return res.data.result
        } catch (e) {
            error.value = 'Не удалось загрузить задачи'
            throw e
        } finally {
            isLoading.value = false
        }
    }

    const createTask = async (task: TodoTask) => { // Создание задачи
        const res = await $api.post('/tasks', task)
        await loadTasks() // Подгрузка обновленных данных после успешной операции
        return res.data
    }

    const deleteTask = async (taskOrId: TodoTask | number) => { // Удаление задачи
        const taskId = typeof taskOrId === 'number' ? taskOrId : taskOrId.id // проверка передается напрямую айди или через обьект
        const res = await $api.delete(`/tasks/${taskId}`) // Запрос по айди через параметры
        await loadTasks() // Подгрузка обновленных данных после успешной операции
        return res.data
    }

    const updateTask = async (task: TodoTask) => { // Обновление задачи
        const res = await $api.put(`/tasks/${task.id}`, task)
        await loadTasks() // Подгрузка обновленных данных после успешной операции
        return res.data
    }

    return {
        tasks,
        meta,
        isLoading,
        error,
        loadTasks,
        getTasks: loadTasks,
        createTask,
        deleteTask,
        updateTask,
    }
}
