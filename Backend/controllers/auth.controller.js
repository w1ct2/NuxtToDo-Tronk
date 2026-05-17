import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.model.js";
import { v4 as uuidv4 } from 'uuid';

const SECRET = process.env.JWT_SECRET || "jwtsecret"; // Получение секрета из env

export const register = async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase(); // Получение и нормализация email
  const password = req.body?.password; // Получение пароля

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" }); // Проверка наличия email и пароля
  }

  const existingUser = await User.findOne({ email }); // Есть ли пользователь с email
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10); // Хэш пароля из запроса

  const user = { // Формирование обьекта пользователя
    userId: uuidv4(),
    email,
    password: hashedPassword,
  };

  await User.create(user);

  return res.status(201).json({ message: "User created" });
};

export const login = async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase(); // Получение и нормализация email
  const password = req.body?.password; // Получение пароля

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" }); // Проверка наличия email и пароля
  }

  const user = await User.findOne({ email }) // Есть ли пользователь с email
  console.log("user in login", user);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  let isMatch = false;
  const isHashedPassword = typeof user.password === "string" && user.password.startsWith("$2"); // Хэширован ли пароль

  if (isHashedPassword) {
    isMatch = await bcrypt.compare(password, user.password); // Сравнение пароля с хэшем
  } else {
    isMatch = password === user.password; // Сравнение пароля с паролем из базы
    if (isMatch) {
      user.password = await bcrypt.hash(password, 10); // Хэширование пароля
    }
  }
  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ userId: user.userId, email: user.email }, SECRET, {expiresIn: "1h"}); // Генерация jwt токена

  return res.json({
    token,
    user: {
      userId: user.userId,
      email: user.email,
    },
  });
};

export const me = async (req, res) => {
  const user = await User.findOne({ userId: req.user?.userId }); // Есть ли пользователь с id

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({ // Возврат данных пользователя
    user: {
      userId: user.userId,
      email: user.email,
    },
  });
};
