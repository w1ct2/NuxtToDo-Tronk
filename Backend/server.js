import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRoutes from "./routes/auth.js";
import taskRoutes from "./routes/tasks.js"

dotenv.config(); // загружает переменные окружения из .env файла

const app = express(); // создает экземпляр Express приложения

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(express.json()); // Автоматический парс json тела запроса

app.get("/", (req, res) => { // Проверка работоспособности сервера
  res.send("API is running");
});

app.use("/api/auth", authRoutes); // Маршруты авторизации
app.use("/api", taskRoutes) // Маршруты задач

const PORT = process.env.PORT || 5000; // Порт для запуска
app.listen(PORT, () => console.log(`Server running on ${PORT}`)); // Запуск сервера
