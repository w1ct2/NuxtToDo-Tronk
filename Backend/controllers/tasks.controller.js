import Task from "../models/tasks.model.js";

const ALLOWED_PRIORITIES = ["low", "medium", "high"]; // Допустимые приоритеты задач

export const getTasks = async (req, res) => { // ПОлучение задач
  const { status, search, sort, isPagin } = req.query // Получение статуса, поиска и настройки пагинации из query
  const userId = req.user.userId;

  const filter = { userId };

  if (status === "completed") {
    filter.isCompleted = true;
  } else if (status === "active") {
    filter.isCompleted = false;
  } // ^ Фильтрация задач при наличии статуса в запросе ^

  if (search) {
    const term = String(search).trim();
    filter.$or = [
      { title: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { createdBy: { $regex: term, $options: "i" } },
    ];
  } // ^ Фильтрация задач при наличии поискового запроса ^

  let result = await Task.find(filter).lean();

  if (sort) {
    const priorityWeight = {
      high: 0,
      medium: 1,
      low: 2,
    };
    const toTaskTime = (value) => {
      if (!value) {
        return NaN;
      }
      const normalizedValue = String(value).trim();
      const pattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
      const match = normalizedValue.match(pattern);
      if (match) {
        const [, day, month, year] = match;
        return new Date(`${year}-${month}-${day}T00:00:00`).getTime();
      }
      return new Date(normalizedValue).getTime();
    };

    if (sort === "name") {
      result = result.sort((a, b) =>
        a.title.localeCompare(b.title, "ru", { sensitivity: "base" }),
      );
    } else if (sort === "author") {
      result = result.sort((a, b) =>
        a.createdBy.localeCompare(b.createdBy, "ru", { sensitivity: "base" }),
      );
    } else if (sort === "priority") {
      result = result.sort(
        (a, b) => priorityWeight[a.priority] - priorityWeight[b.priority],
      );
    } else if (sort === "date") {
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

  const shouldPaginate = isPagin === "true" || isPagin === true; // нужна ли пагинация
  const requestedPage = Number(req.query.page) || 1; // номер страницы с запроса (чанка)
  const totalItems = result.length; // всего элементов в итоге
  const limit = shouldPaginate ? Number(req.query.limit) || 8 : totalItems || 1; // лимит
  const page = shouldPaginate ? requestedPage : 1; // страница
  let pagedResult = result;

  if (shouldPaginate) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    pagedResult = result.slice(startIndex, endIndex);
  }

  return res.status(200).json({
    result: pagedResult, // Результат
    page: page,
    limit: limit,
    total: totalItems,
    totalPages: shouldPaginate ? Math.max(Math.ceil(totalItems / limit), 1) : 1,
    // ^ Мета-данные ответа ^
  });
};

export const createTask = async (req, res) => { // Создание задачи
  const payload = req.body?.task ?? req.body;

  if (!payload || !payload.title) { // Проверка наличия заголовка задачи
    return res.status(400).json({ message: "title is required" });
  } // ^ Проверка наличия заголовка задачи ^

  const newTask = { // Формирование  обьекта новой задачи
    userId: req.user.userId,
    title: String(payload.title).trim(),
    description: String(payload.description ?? "").trim(),
    dueDate: payload.dueDate || new Date().toISOString().slice(0, 10),
    isCompleted: Boolean(payload.isCompleted),
    createdBy: String(payload.createdBy ?? "Unknown").trim(),
    priority: ALLOWED_PRIORITIES.includes(payload.priority) ? payload.priority : "medium",
  };

  try {
    await Task.create(newTask);
    return res.status(201).json(newTask);
  } catch (error) {
    console.error("createTask:", error);
    return res.status(500).json({
      message: "Failed to save task",
      details: error.message,
    });
  }
};

export const deleteTask = async (req, res) => { // Удаление задачи
  const id = req.params.id; // id задачи

  try {
    const deleteResult = await Task.deleteOne({ _id: id });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Task not found in database" });
    }
    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    console.error("deleteTask:", error);
    return res.status(500).json({ message: "Failed to delete task" });
  }
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

  try {
    await Task.updateOne({ id }, task);
    return res.status(200).json(task);
  } catch (error) {
    console.error("updateTask:", error);
    return res.status(500).json({
      message: "Failed to update task",
      details: error.message,
    });
  }
};
