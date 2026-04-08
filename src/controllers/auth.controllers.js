import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Usuario } from "../models/index.js";

const SECRET = process.env.SECRET;

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Usuario.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Credenciales inválidas",
      });
    }

    const payload = {
      id: user.id,
      email: user.email,
    };

    const token = jwt.sign(payload, SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false, // 🔴 true en producción (HTTPS)
      sameSite: "lax", // 🔥 importante para frontend separado
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  console.log(name, email, password);
  try {
    const userExists = await Usuario.findOne({ where: { email } });

    if (userExists) {
      return res.status(409).json({ error: "El usuario ya existe en sistema" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Usuario.create({
      name,
      email,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "create user success",
    });
  } catch (error) {
    return res.status(500).json({ error: "Server internal error" });
  }
};

export const logout = (req, res) => {
  return res.clearCookie("token").redirect("/login");
};
