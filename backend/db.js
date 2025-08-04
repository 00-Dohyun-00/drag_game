import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// // 연결 시마다 한국 시간대 설정
// pool.on("connect", async (client) => {
//   try {
//     await client.query("SET TIME ZONE 'Asia/Seoul'");
//     console.log("새 연결에 Asia/Seoul 시간대 설정");
//   } catch (error) {
//     console.error("시간대 설정 실패:", error);
//   }
// });

export default pool;
