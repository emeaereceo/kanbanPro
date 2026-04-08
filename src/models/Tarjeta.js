import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Tarjeta = sequelize.define("Tarjetas", {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
  },
  tag: {
    type: DataTypes.STRING,
  },
  start_date: DataTypes.DATE,
  due_date: DataTypes.DATE,
  author: DataTypes.STRING,
});
