import type { TaskFilter, TodoTask } from "~/components/pages/index/types"

export const useTasks = () => {
    const { $api } = useNuxtApp()

    const getTasks = async (status: TaskFilter = "all", search = "") => {
        const res = await $api.get<TodoTask[]>('/tasks', {
            params: { status, search },
        })
        return res.data
    }

    const createTask = async (task: TodoTask) => {
        const res = await $api.post('/tasks', task)
        return res.data
    }

    const deleteTask = async (task: TodoTask) => {
        const res = await $api.delete(`/tasks/${task.id}`)
        return res.data
    }

    const updateTask = async (task: TodoTask) => {
        const res = await $api.put(`/tasks/${task.id}`, task)
        return res.data
    }

    return { getTasks, createTask, deleteTask, updateTask}
}
