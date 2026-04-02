import tasks from "../data/tasks.js";

const ALLOWED_PRIORITIES = ["low", "medium", "high"]; // Допустимые приоритеты задач

export const getTasks = async (req, res) => { // ПОлучение задач
  const { status, search } = req.params // Получение статуса задачи и поискового запроса из параметров
  let result = [...tasks]; // Копирование задач в рабочую переменную

  if (status === "completed") {
    result = result.filter((task) => task.isCompleted);
  } else if (status === "active") {
    result = result.filter((task) => !task.isCompleted);
  } else if (status === "all") {
    result = result
  } // ^ Фильтрация задач при наличии статуса в запросе ^

  if (search) {
    const term = String(search).toLowerCase().trim();
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(term) ||
        task.description.toLowerCase().includes(term) ||
        task.createdBy.toLowerCase().includes(term),
    );
  } // ^ Фильтрация задач при наличии поискового запроса ^

  return res.status(200).json(result);
};

export const createTask = async (req, res) => { // Создание задачи
  const payload = req.body?.task ?? req.body;

  if (!payload || !payload.title) { // Проверка наличия заголовка задачи
    return res.status(400).json({ message: "title is required" });
  } // ^ Проверка наличия заголовка задачи ^

  const newTask = { // Формирование  обьекта новой задачи
    id: Date.now(),
    title: String(payload.title).trim(),
    description: String(payload.description ?? "").trim(),
    dueDate: payload.dueDate || new Date().toISOString().slice(0, 10),
    isCompleted: Boolean(payload.isCompleted),
    createdBy: String(payload.createdBy ?? "Unknown").trim(),
    priority: ALLOWED_PRIORITIES.includes(payload.priority) ? payload.priority : "medium",
  };

  tasks.push(newTask);
  return res.status(201).json(newTask);
};

export const deleteTask = async (req, res) => { // Удаление задачи
  const id = Number(req.params?.id ?? req.body?.id); // Приведение айди к числу при его наличии
  if (!id) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const index = tasks.findIndex((task) => task.id === id); // Поиск задачи
  if (index === -1) {
    return res.status(404).json({ message: "Task not found" });
  }

  const [removedTask] = tasks.splice(index, 1); // Удаление
  return res.status(200).json(removedTask);
};

export const updateTask = async (req, res) => { // Обновление задачи
  const id = Number(req.params?.id ?? req.body?.id ?? req.body?.task?.id); // Приведение айди к числу при его наличии
  const payload = req.body?.task ?? req.body; // ДАнные 

  if (!id) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const task = tasks.find((item) => item.id === id); // Поиск задачи
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (!payload || typeof payload !== "object") {
    return res.status(400).json({ message: "Nothing to update" });
  }

  if (payload.title !== undefined) task.title = String(payload.title).trim();
  if (payload.description !== undefined) task.description = String(payload.description).trim();
  if (payload.dueDate !== undefined) task.dueDate = payload.dueDate;
  if (payload.isCompleted !== undefined) task.isCompleted = Boolean(payload.isCompleted);
  if (payload.createdBy !== undefined) task.createdBy = String(payload.createdBy).trim();
  if (payload.priority !== undefined && ALLOWED_PRIORITIES.includes(payload.priority)) {
    task.priority = payload.priority;
  } // ^ Обновление задачи при наличии полей в payload ^

  return res.status(200).json(task);
};
