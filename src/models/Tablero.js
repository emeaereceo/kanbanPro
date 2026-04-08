import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Tablero = sequelize.define("Tableros", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  color: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  visibility: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
