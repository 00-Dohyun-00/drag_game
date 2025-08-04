import express from "express";
import pool from "../db.js";

const router = express.Router();

// 점수 저장
router.post("/save_score", async (req, res) => {
  console.log("=== /score/save_score 요청 받음 ===");
  console.log("req.body:", req.body);

  try {
    const { user_id, score } = req.body;

    // 점수 삽입 (한국 시간으로)
    const result = await pool.query(
      "INSERT INTO game_scores (user_id, score, created_at) VALUES ($1, $2, NOW() AT TIME ZONE 'Asia/Seoul') RETURNING *",
      [user_id, score]
    );

    const savedScore = result.rows[0];

    res.status(200).json({
      success: true,
      message: "점수 저장 성공",
      data: {
        score: {
          id: savedScore.id,
          user_id: savedScore.user_id,
          score: savedScore.score,
          created_at: savedScore.created_at,
        },
      },
    });
  } catch (error) {
    console.error("점수 저장 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

export default router;
