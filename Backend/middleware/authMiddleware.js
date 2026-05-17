import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "jwtsecret";

export const authMiddleware = (req, res, next) => { // Middleware для проверки авторизации
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Invalid token" });
    }
    const token = authHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, SECRET);
    req.user = decodedToken; // добавление decodedToken в req.user
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
