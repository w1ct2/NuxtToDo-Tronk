import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import users from "../data/users.js";

const SECRET = process.env.JWT_SECRET || "jwtsecret";

export const register = async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const existingUser = users.find((u) => u.email === email);
  if (existingUser) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now(),
    email,
    password: hashedPassword,
  };

  users.push(user);

  return res.status(201).json({ message: "User created" });
};

export const login = async (req, res) => {
  const email = req.body?.email?.trim()?.toLowerCase();
  const password = req.body?.password;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = users.find((u) => u.email === email);
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  let isMatch = false;
  const isHashedPassword = typeof user.password === "string" && user.password.startsWith("$2");

  if (isHashedPassword) {
    isMatch = await bcrypt.compare(password, user.password);
  } else {
    isMatch = password === user.password;
    if (isMatch) {
      user.password = await bcrypt.hash(password, 10);
    }
  }
  if (!isMatch) {
    return res.status(400).json({ message: "Wrong password" });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, {
    expiresIn: "1h",
  });

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  });
};

export const me = (req, res) => {
  const user = users.find((u) => u.id === req.user?.id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
    },
  });
};
