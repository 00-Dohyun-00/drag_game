import express from "express";
import pool from "./server.js";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.send(`PostgreSQL 연결됨: ${result.rows[0].now}`);
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
