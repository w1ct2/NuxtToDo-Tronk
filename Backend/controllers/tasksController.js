import tasks from "../data/tasks.js";

const ALLOWED_PRIORITIES = ["low", "medium", "high"]; // Допустимые приоритеты задач

export const getTasks = async (req, res) => { // ПОлучение задач
  const { status, search, sort, isPagin } = req.query // Получение статуса, поиска и настройки пагинации из query
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

  if (sort) {
    const priorityWeight = { // Вес приоритетов задач, для сортировки
      high: 0,
      medium: 1,
      low: 2,
    }
    const toTaskTime = (value) => { // Нормализация даты
      if (!value) {
        return NaN;
      }
      const normalizedValue = String(value).trim();
      const pattern = /^(\d{2})\.(\d{2})\.(\d{4})$/; // dd.mm.yyyy
      const match = normalizedValue.match(pattern);
      if (match) {
        const [, day, month, year] = match;
        return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
      }
      return new Date(normalizedValue).getTime();
    }

    if (sort === 'name') {
      result = result.sort((a, b) => a.title.localeCompare(b.title, 'ru', { sensitivity: 'base' }));
    } else if (sort === 'author') {
      result = result.sort((a, b) => a.createdBy.localeCompare(b.createdBy, 'ru', { sensitivity: 'base' }));
    } else if (sort === 'priority') {
      result = result.sort((a, b) => priorityWeight[a.priority] - priorityWeight[b.priority]);
    } else if (sort === 'date') {
      result = result.sort((a, b) => {
        const leftTime = toTaskTime(a.dueDate);
        const rightTime = toTaskTime(b.dueDate);

        if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
          return 0;
        }

        if (Number.isNaN(leftTime)) {
          return 1;
        }

        if (Number.isNaN(rightTime)) {
          return -1;
        }

        return leftTime - rightTime;
      });
    }
  } // ^ Сортировка задач при наличии сорт. запроса ^

  const shouldPaginate = isPagin === "true" || isPagin === true // нужна ли пагинация
  const requestedPage = Number(req.query.page) || 1 // номер страницы с запроса (чанка)
  const totalItems = result.length // всего элементов в итге
  const limit = shouldPaginate ? Number(req.query.limit) || 8 : totalItems || 1 // лимит
  const page = shouldPaginate ? requestedPage : 1 // страница
  let pagedResult = result;

  if (shouldPaginate) {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit 
    pagedResult = result.slice(startIndex, endIndex) 
  }

  return res.status(200).json({
    result: pagedResult, // Результат
    page: page,
    limit: limit,
    total: totalItems,
    totalPages: shouldPaginate ? Math.max(Math.ceil(totalItems / limit), 1) : 1,
    allTasks: tasks,
    // ^ Мета-данные ответа ^
  });
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
