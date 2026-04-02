import type { TaskFilter, TodoTask } from "~/components/pages/index/types"

export const useTasks = () => {
    const { $api } = useNuxtApp()
    const tasks = useState<TodoTask[]>('tasks:list', () => [])
    const isLoading = useState<boolean>('tasks:loading', () => false)
    const error = useState<string | null>('tasks:error', () => null)

    const loadTasks = async (status: TaskFilter = "all", search = "") => { // Функция подгрузки задач с сервера, сделана для поддержания реактивности при изменениях
        isLoading.value = true
        error.value = null

        try {
            const res = await $api.get<TodoTask[]>('/tasks', {
                params: { status, search },
            })

            tasks.value = res.data
            return res.data
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
        isLoading,
        error,
        loadTasks,
        getTasks: loadTasks,
        createTask,
        deleteTask,
        updateTask,
    }
}
