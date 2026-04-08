import express from "express";
import cookieParser from "cookie-parser";
import "dotenv/config";
import { sequelize } from "./config/sequelize.js";
import routes from "./routes/index.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(express.static("public"));
app.use("/", routes);

async function startServer() {
  try {
    // Sincronizo modelos
    await sequelize.sync();
    console.log("Modelos sincronizados");

    // Inicia el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor :", error);
  }
}

startServer();
