import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  database: process.env.DB_NAME as string,
  password: process.env.DB_PASSWORD as string
});

export default pool;
