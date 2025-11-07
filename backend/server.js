import express from "express";
import cors from "cors";
import { db } from "./db.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta para obtener todos los usuarios
app.get("/api/users", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en el servidor");
  }
});

app.get("/api/auth", async (req, res) => {
  const { usuario, contrasenia } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT UsuarioId, NombreCompleto, Correo FROM usuarios WHERE Correo = ? AND Contraseña = ? AND estaActivo = true",
      [usuario, contrasenia]
    );

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en la autenticación");
  }
});

// Ruta para agregar un usuario
app.post("/api/users", async (req, res) => {
  const { userName, email, password, userPhone } = req.body;
  try {
    const [result] = await db.query("INSERT INTO usuarios (NombreCompleto, Correo, Contraseña, NumeroTelefonico) VALUES (?, ?, ?, ?)", [userName, email, password, userPhone]);
    res.json({ id: result.insertId, userName, email, password, userPhone });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al insertar usuario");
  }
});

app.post("/api/movimientosusuario", async (req, res) => {
  const { tipo, descripcion, monto, idUsuarioLogeado } = req.body;
  try {
    const [result] = await db.query("INSERT INTO movimientos (tipogasto, Nombre, Gasto, Fecha, fkusuarios) VALUES (?, ?, ?, NOW(), ?)", [tipo, descripcion, monto, idUsuarioLogeado]);
    res.json({ id: result.insertId, tipo, descripcion, monto });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al insertar gasto");
  }
});

// Ruta para obtener movimientos por usuario
app.get("/api/movimientosusuario", async (req, res) => {
  const { idUsuarioLogeado } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT tm.Id as idGasto, tm.Nombre as tipoMovimiento, m.Id as idMovimiento, m.Nombre as nombreMovimiento, m.Gasto as valorMovimiento, m.Fecha as fechaMovimiento FROM movimientos m inner join tipoMovimiento tm on m.tipogasto = tm.Id inner join usuarios u on m.fkusuarios = u.UsuarioId where u.UsuarioId = ?",
      [idUsuarioLogeado]
    );

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en la autenticación");
  }
});

// ruta para buscar movimientos por usuario y nombre
app.get("/api/busquedamovimientos", async (req, res) => {
  const { idUsuarioLogeado, nombreMovimiento } = req.query;
  try {
    const [rows] = await db.query(
      "SELECT tm.Id as idGasto, tm.Nombre as tipoMovimiento, m.Id as idMovimiento, m.Nombre as nombreMovimiento, m.Gasto as valorMovimiento, m.Fecha as fechaMovimiento FROM movimientos m inner join tipoMovimiento tm on m.tipogasto = tm.Id inner join usuarios u on m.fkusuarios = u.UsuarioId where u.UsuarioId = ? AND m.Nombre like '%' ? '%'",
      [idUsuarioLogeado, nombreMovimiento]
    );

    if (rows.length > 0) {
      res.json(rows);
    } else {
      res.json(rows);
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error en la consulta de movimientos");
  }
});

// Ruta para eliminar un movimiento por id
async function handleDeleteMovimiento(req, res) {
  const id = req.query.id ?? req.params.id;
  if (!id) {
    return res.status(400).json({ success: false, message: "Falta el parámetro id" });
  }
  try {
    const [result] = await db.query("DELETE FROM movimientos WHERE Id = ?", [id]);

    if (result.affectedRows && result.affectedRows > 0) {
      res.json({ success: true, deletedId: Number(id) });
    } else {
      res.status(404).json({ success: false, message: "Movimiento no encontrado" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Error al eliminar movimiento");
  }
}

app.delete("/api/deleteMovimientos", handleDeleteMovimiento);
app.delete("/api/deleteMovimientos/:id", handleDeleteMovimiento);

app.get("/api/deleteMovimientos", handleDeleteMovimiento);
app.get("/api/deleteMovimientos/:id", handleDeleteMovimiento);

// Use a default port if PORT_BACKEND is not set
const PORT = process.env.PORT_BACKEND;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
