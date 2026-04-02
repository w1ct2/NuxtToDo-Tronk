import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "jwtsecret"; // Получение секрета из env

export const authMiddleware = (req, res, next) => { // Middleware для проверки авторизации
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) { // Проверка наличия токена
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload;
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};
