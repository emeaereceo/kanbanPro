import { fn, col, literal } from "sequelize";
import { Lista, Tablero, Tarjeta, Usuario } from "../models/index.js";

// ─────────────────────────────────────────────
// USUARIO
// ─────────────────────────────────────────────

export const getCurrentUser = async (req, res) => {
  try {
    const user = await Usuario.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
    });

    if (!user) {
      return res.status(404).json({
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

// ─────────────────────────────────────────────
// TABLEROS
// ─────────────────────────────────────────────

export const getAllTableros = async (req, res) => {
  try {
    const tableros = await Tablero.findAll({
      attributes: [
        "id",
        "name",
        "description",
        "color",
        "visibility",
        "updatedAt",
        [literal('COUNT(DISTINCT "Listas->Tarjetas"."id")'), "totalTareas"],
      ],
      include: [
        {
          model: Lista,
          attributes: [],
          required: false,
          include: [
            {
              model: Tarjeta,
              attributes: [],
              required: false,
            },
          ],
        },
      ],
      group: [
        "Tableros.id",
        "Tableros.name",
        "Tableros.description",
        "Tableros.color",
        "Tableros.visibility",
        "Tableros.updatedAt",
      ],
    });

    return res.json(tableros);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const getBoardById = async (req, res) => {
  const { boardId } = req.params;

  try {
    const tablero = await Tablero.findByPk(boardId, {
      include: {
        model: Lista,
        include: Tarjeta,
      },
    });
    if (!tablero)
      return res.status(404).json({ error: "Tablero no encontrado" });
    return res.json(tablero);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const createTablero = async (req, res) => {
  const { name, description, color, visibility } = req.body;
  const userId = req.user.id;
  if (!name) return res.status(400).json({ error: "El nombre es requerido" });

  console.log("Y en el backend?");
  try {
    const tablero = await Tablero.create({
      name,
      description,
      color,
      visibility,
      userId,
    });
    return res.status(201).json(tablero);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// export const updateTablero = async (req, res) => {
//   const { tableroId } = req.params;
//   const { name } = req.body;

//   try {
//     const tablero = await Tablero.findByPk(tableroId);
//     if (!tablero)
//       return res.status(404).json({ error: "Tablero no encontrado" });

//     await tablero.update({ name });
//     return res.json(tablero);
//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

export const deleteTablero = async (req, res) => {
  const { boardId } = req.params;

  try {
    const tablero = await Tablero.findByPk(boardId);
    if (!tablero)
      return res.status(404).json({ error: "Tablero no encontrado" });

    await tablero.destroy();
    return res.json({ message: "Tablero eliminado correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// LISTAS
// ─────────────────────────────────────────────

export const createLista = async (req, res) => {
  const { tableroId } = req.params;
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "El nombre es requerido" });

  try {
    const tablero = await Tablero.findByPk(tableroId);
    if (!tablero)
      return res.status(404).json({ error: "Tablero no encontrado" });

    const lista = await Lista.create({ name, boardId: tableroId });
    return res.status(201).json(lista);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateLista = async (req, res) => {
  const { tableroId, listaId } = req.params;
  const { name } = req.body;

  try {
    const lista = await Lista.findOne({
      where: { id: listaId, boardId: tableroId },
    });
    if (!lista) return res.status(404).json({ error: "Lista no encontrada" });

    await lista.update({ name });
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteLista = async (req, res) => {
  const { tableroId, listaId } = req.params;

  try {
    const lista = await Lista.findOne({
      where: { id: listaId, boardId: tableroId },
    });
    if (!lista) return res.status(404).json({ error: "Lista no encontrada" });

    await lista.destroy();
    return res.json({ message: "Lista eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// ─────────────────────────────────────────────
// TARJETAS
// ─────────────────────────────────────────────

export const createTarjeta = async (req, res) => {
  const { listaId } = req.params;
  const {
    title,
    description,
    priority,
    tag,
    status,
    start_date,
    due_date,
    autor,
  } = req.body;

  if (!title) return res.status(400).json({ error: "El título es requerido" });

  try {
    const lista = await Lista.findByPk(listaId);
    if (!lista) return res.status(404).json({ error: "Lista no encontrada" });

    const tarjeta = await Tarjeta.create({
      title,
      description,
      priority,
      tag,
      status,
      creation_date: new Date(),
      start_date,
      due_date,
      autor,
      listId: listaId,
    });
    return res.status(201).json(tarjeta);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const updateTarjeta = async (req, res) => {
  const { listaId, tarjetaId } = req.params;
  const {
    title,
    description,
    priority,
    tag,
    status,
    start_date,
    due_date,
    autor,
  } = req.body;

  try {
    const tarjeta = await Tarjeta.findOne({
      where: { id: tarjetaId, listId: listaId },
    });
    if (!tarjeta)
      return res.status(404).json({ error: "Tarjeta no encontrada" });

    await tarjeta.update({
      title,
      description,
      priority,
      tag,
      status,
      start_date,
      due_date,
      autor,
    });
    return res.json(tarjeta);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

export const deleteTarjeta = async (req, res) => {
  const { listaId, tarjetaId } = req.params;

  try {
    const tarjeta = await Tarjeta.findOne({
      where: { id: tarjetaId, listId: listaId },
    });
    if (!tarjeta)
      return res.status(404).json({ error: "Tarjeta no encontrada" });

    await tarjeta.destroy();
    return res.json({ message: "Tarjeta eliminada correctamente" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
