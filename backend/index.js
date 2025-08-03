import express from "express";
import pool from "./server.js";

const app = express();
const port = 3000;

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.send(`PostgreSQL 연결됨: ${result.rows[0].now}`);
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT (NOW() + INTERVAL '9 hour') AS kst_time"
    );
    res.json({
      success: true,
      kstTime: result.rows[0].kst_time,
    });
  } catch (err) {
    console.error("쿼리 실패:", err);
    res.status(500).json({ success: false });
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
