import "dotenv/config";
import cors from "cors";
import mongoose from "mongoose";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import taskRoutes from "./routes/tasks.routes.js"

const app = express(); // создает экземпляр Express приложения
app.use( // Подключение CORS
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json()); // Автоматический парс json тела запроса

const startFunc = async () => {
  try {
    // Подключение к MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    const db = mongoose.connection;
    db.on("error", console.error.bind(console, "connection error:"));
    db.once("open", () => console.log("Connected to MongoDB"));

    // Запуск сервера
    const PORT = process.env.PORT || 5001; // Порт для запуска (на macOS 5000 занят)
    app.listen(PORT, () => console.log(`Server running on ${PORT}`));

  } catch (error) {
    console.error("Error connecting to MongoDB", error);
  }
}

app.get("/", (req, res) => { // Проверка работоспособности сервера
  res.send("API is running");
});

app.use("/api/auth", authRoutes); // Маршруты авторизации
app.use("/api", taskRoutes) // Маршруты задач

startFunc();