import type { TaskFilter, TaskSort, TodoTask } from "~/components/pages/index/types"

// тип ответа запроса задач
type GetTasksResponse = {
    result: TodoTask[]
    page: number
    limit: number
    total: number
    totalPages: number
}

export const useTasks = () => {
    const tasks = useState<TodoTask[]>('tasks:list', () => []) // сами задачи
    const meta = useState<GetTasksResponse>('tasks:meta', () => ({ //мета данные запроса
        result: [],
        page: 1,
        limit: 3,
        total: 0,
        totalPages: 1,
    }))
    /** Обьект для занесения в память данных последнего запроса. 
     * без этого случаютсч баги с подгрузкой задач,
     * слетает пагинация/отпадает реактивность*/ 
    const lastRequest = useState('tasks:last-request', () => ({ 
        status: 'all' as TaskFilter,
        search: '',
        sort: 'name' as TaskSort,
        isPagin: false,
        page: 1,
        limit: undefined as number | undefined,
    }))
    const error = useState<string | null>('tasks:error', () => null)

    // запрос задач
    const tasksRequest = useApiRequest<GetTasksResponse>({
        url: "/tasks",
        method: "GET",
    })
    // запрос на мутацию
    const mutationRequest = useApiRequest({
        url: "/tasks",
    })
    const isLoading = tasksRequest.isLoading

    const loadTasks = async (
        status: TaskFilter = lastRequest.value.status,
        search = lastRequest.value.search,
        sort: TaskSort = lastRequest.value.sort,
        isPagin = lastRequest.value.isPagin,
        page = lastRequest.value.page,
        limit?: number
    ) => { // Функция подгрузки задач с сервера, сделана для поддержания реактивности при изменениях
        error.value = null

        try {
            const response = await tasksRequest.execute({
                params: { status, search, sort, isPagin, page, limit: limit ?? lastRequest.value.limit },
            })

            tasks.value = response.result
            meta.value = response

            lastRequest.value = {
                status,
                search,
                sort,
                isPagin,
                page,
                limit: limit ?? lastRequest.value.limit,
            }

            return response.result
        } catch (e) {
            error.value = 'Не удалось загрузить задачи'
            throw e
        }
    }

    const createTask = async (task: TodoTask) => { // Создание задачи
        const response = await mutationRequest.execute({
            method: "POST",
            body: task,
        })
        await loadTasks() // Подгрузка обновленных данных после успешной операции
        return response
    }

    const deleteTask = async (taskOrId: TodoTask | number) => { // Удаление задачи
        const taskId = typeof taskOrId === 'number' ? taskOrId : taskOrId.id // проверка передается напрямую айди или через обьект
        const response = await mutationRequest.execute({
            method: "DELETE",
            url: `/tasks/${taskId}`,
        }) // Запрос по айди через параметры
        await loadTasks() // Подгрузка обновленных данных после успешной операции
        return response
    }

    const updateTask = async (task: TodoTask) => { // Обновление задачи
        const response = await mutationRequest.execute({
            method: "PUT",
            url: `/tasks/${task.id}`,
            body: task,
        })
        await loadTasks() // Подгрузка обновленных данных после успешной операции
        return response
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
