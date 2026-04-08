import { Sequelize } from "sequelize";

const dbName = process.env.DB_NAME;
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASSWORD;
const dbHost = process.env.DB_HOST;

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  dialect: "postgres",
  // logging: console.log,
});

const connValidate = async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexion a la base de datos realizada");
  } catch (error) {
    console.error("No se pudo conectar con la DB", error);
  }
};

connValidate();
