import { DataTypes } from "sequelize";
import { sequelize } from "../config/sequelize.js";

export const Lista = sequelize.define("Listas", {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});
