import express from "express";
import { login, me, register } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router(); // Экземпляр роутер для маршрутов

router.post("/register", register); // Маршрут регистрации
router.post("/login", login); // Маршрут авторизации
router.get("/me", authMiddleware, me); // Маршрут проверки авторизации

export default router;
