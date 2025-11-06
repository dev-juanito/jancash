import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

export const db = await mysql.createConnection({
    host: process.env.DB_HOST,       // o process.env.DB_HOST si lo tienes definido
    user: process.env.DB_USER,
    password: '',            // sin contraseña
    database: process.env.DB_NAME, // o process.env.DB_NAME si usas variables
    port: process.env.PORT_DB

});

console.log("Conexión a MySQL establecida");