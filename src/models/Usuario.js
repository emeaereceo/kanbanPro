import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Usuario = sequelize.define("Usuarios", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: "user",
  },
});
