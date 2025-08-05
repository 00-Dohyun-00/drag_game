import express from "express";
import pool from "../db.js";

const router = express.Router();

// 점수 저장
router.post("/save_score", async (req, res) => {
  console.log("=== /score/save_score 요청 받음 ===");
  console.log("req.body:", req.body);

  try {
    const { user_id, score } = req.body;

    // 기존 최고점수 조회
    const bestScoreResult = await pool.query(
      "SELECT best_score FROM user_best_scores WHERE user_id = $1",
      [user_id]
    );

    if (bestScoreResult.rows.length > 0) {
      // 기존 최고점수가 있는 경우
      const currentBestScore = bestScoreResult.rows[0].best_score;

      if (score > currentBestScore) {
        // 새 점수가 더 높으면 업데이트
        await pool.query(
          "UPDATE user_best_scores SET best_score = $1, achieved_at = NOW() AT TIME ZONE 'Asia/Seoul' WHERE user_id = $2",
          [score, user_id]
        );
      }
    } else {
      // 최고점수 기록이 없는 경우 새로 생성
      await pool.query(
        "INSERT INTO user_best_scores (user_id, best_score, achieved_at) VALUES ($1, $2, NOW() AT TIME ZONE 'Asia/Seoul')",
        [user_id, score]
      );
    }

    // 점수 기록 삽입
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
