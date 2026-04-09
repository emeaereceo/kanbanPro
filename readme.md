# KanbanPro API

Backend REST con Express, Sequelize y autenticación JWT via cookies.

---

## Requisitos

- Node.js 18+
- Docker y Docker Compose (recomendado) **o** PostgreSQL instalado localmente

---

## Base de datos

### Con Docker (recomendado)

```bash
docker compose up -d
```

`docker-compose.yml`:

```yaml
version: "3.8"
services:
  db:
    image: postgres:16
    restart: always
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: admin123
      POSTGRES_DB: kanbanpro
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Sin Docker

Crea una base de datos PostgreSQL manualmente y configura las credenciales en el archivo `.env`.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
PORT=3000

# Base de datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kanbanpro
DB_USER=admin
DB_PASSWORD=admin123

# JWT
SECRET=tu_secreto_seguro

```

---

## Instalación

```bash
pnpm install
pnpm run dev
```

Sequelize sincronizará los modelos automáticamente al iniciar.

---

## Modelos

| Modelo  | Descripción                   |
| ------- | ----------------------------- |
| Usuario | Usuarios registrados          |
| Tablero | Tableros kanban por usuario   |
| Lista   | Columnas dentro de un tablero |
| Tarjeta | Tareas dentro de una lista    |

---

## Autenticación

JWT almacenado en una cookie `httpOnly`. Un middleware valida el token en cada ruta protegida.

```
POST /api/v1/auth/register   → Crear cuenta
POST /api/v1/auth/login      → Iniciar sesión (setea cookie)
POST /api/v1/auth/logout     → Cerrar sesión (limpia cookie)
```

---

## Endpoints

### Usuario

```
GET  /api/v1/users/me                        → Perfil del usuario autenticado
```

### Tableros

```
GET    /api/v1/boards                        → Listar tableros del usuario
GET    /api/v1/boards/:boardId               → Obtener tablero con listas y tareas
POST   /api/v1/boards                        → Crear tablero
PUT    /api/v1/boards/:boardId               → Actualizar tablero
DELETE /api/v1/boards/:boardId               → Eliminar tablero
```

### Listas

```
POST   /api/v1/boards/:boardId/lists         → Crear lista en un tablero
```

### Tareas

```
POST   /api/v1/lists/:listId/tasks           → Crear tarea en una lista
PUT    /api/v1/tasks/:taskId                 → Actualizar tarea
```

---

## Flujo de uso

1. **Registrarse** → `POST /auth/register`
2. **Iniciar sesión** → `POST /auth/login`
3. **Crear un tablero** → `POST /boards`
4. **Crear listas** en el tablero → `POST /boards/:boardId/lists`
5. **Crear tareas** en cada lista → `POST /lists/:listId/tasks`

---

## Middleware de autenticación

Todas las rutas excepto `/auth/register` y `/auth/login` requieren un JWT válido en la cookie. El middleware extrae y verifica el token automáticamente.

## Frontend

Esta construido con html, js y css

Contiene landing, register, login, boards y dashboard
