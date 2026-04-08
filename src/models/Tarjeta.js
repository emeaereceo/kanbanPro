import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Tarjeta = sequelize.define(
  "Tarjetas",
  {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.STRING,
    priority: {
      type: DataTypes.ENUM("Feature", "Task", "Bug", "Improvement"),
    },
    tag: {
      type: DataTypes.STRING,
    },
    // TODO : el status es el tipo de lista?
    // TODO : Verificar
    // TODO : Estado, eliminado??
    status: {
      type: DataTypes.ENUM("Backlog", "Doing", "Review", "Done"),
    },
    creation_date: DataTypes.DATE,
    start_date: DataTypes.DATE,
    due_date: DataTypes.DATE,
    autor: DataTypes.STRING,
  },
  {
    timestamps: false,
  },
);
