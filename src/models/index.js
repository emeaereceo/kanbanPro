// Definicion de relaciones en el archivo index.js de models

import { Tablero } from "./Tablero.js";
import { Usuario } from "./Usuario.js";
import { Lista } from "./Lista.js";
import { Tarjeta } from "./Tarjeta.js";

// En mi caso, tengo la opcion de crear mas de un tablero
Usuario.hasMany(Tablero, {
  foreignKey: "userId",
});
Tablero.belongsTo(Usuario, {
  foreignKey: "userId",
});

Tablero.hasMany(Lista, {
  foreignKey: "boardId",
});
Lista.belongsTo(Tablero, {
  foreignKey: "boardId",
});

Lista.hasMany(Tarjeta, {
  foreignKey: "listId",
});
Tarjeta.belongsTo(Lista, {
  foreignKey: "listId",
});

export { Tablero, Usuario, Lista, Tarjeta };
