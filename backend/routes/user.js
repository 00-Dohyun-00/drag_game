import express from "express";
import pool from "../db.js";

const router = express.Router();

// // 사용자 프로필 조회
// router.get("/profile", async (req, res) => {
//   console.log("=== /user/profile 요청 받음 ===");

//   try {
//     // 세션에서 user_id 가져오기
//     const user_id = req.session?.user?.id;

//     if (!user_id) {
//       return res.status(401).json({
//         success: false,
//         message: "로그인이 필요합니다",
//       });
//     }

//     const userResult = await pool.query(
//       "SELECT id, username FROM users WHERE id = ?",
//       [user_id]
//     );

//     if (userResult.length === 0) {
//       return res.status(404).json({
//         success: false,
//         message: "사용자를 찾을 수 없습니다",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       message: "프로필 조회 성공",
//       data: userResult[0],
//     });
//   } catch (error) {
//     console.error("프로필 조회 오류:", error);
//     res.status(500).json({
//       success: false,
//       message: "서버 오류가 발생했습니다",
//     });
//   }
// });

// 게임 기록 및 통계 조회
router.get("/game-history", async (req, res) => {
  console.log("=== /user/game-history 요청 받음 ===");

  try {
    // Passport 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요합니다",
      });
    }

    const user_id = req.user.id;

    // 해당 사용자의 게임 기록만 조회
    const historyResult = await pool.query(
      `SELECT 
        gs.id,
        gs.user_id, 
        gs.score, 
        gs.created_at,
        u.username
      FROM game_scores gs
      JOIN users u ON gs.user_id = u.id
      WHERE gs.user_id = $1
      ORDER BY gs.created_at DESC`,
      [user_id]
    );

    // PostgreSQL 결과는 .rows에 있음
    const gameRecords = historyResult.rows;

    // 통계 계산
    const scores = gameRecords.map((record) => record.score);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, score) => sum + score, 0) / scores.length
          )
        : 0;
    const totalGames = scores.length;

    res.status(200).json({
      success: true,
      message: "게임 기록 조회 성공",
      data: {
        game_history: gameRecords,
        statistics: {
          best_score: bestScore,
          average_score: averageScore,
          total_games: totalGames,
        },
      },
    });
  } catch (error) {
    console.error("게임 기록 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 닉네임 변경
router.put("/nickname", async (req, res) => {
  console.log("=== /user/nickname 요청 받음 ===");

  try {
    // Passport 인증 확인
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "로그인이 필요합니다",
      });
    }

    const user_id = req.user.id;
    const { nickname } = req.body;

    if (!nickname || nickname.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "닉네임을 입력해주세요",
      });
    }

    if (nickname.length > 10) {
      return res.status(400).json({
        success: false,
        message: "닉네임은 10자 이하로 입력해주세요",
      });
    }

    // 특수문자 검증 (한글, 영어, 숫자만 허용)
    const KO_EN_NUM_REGEX = /^[가-힣a-zA-Z0-9]+$/;
    if (!KO_EN_NUM_REGEX.test(nickname.trim())) {
      return res.status(400).json({
        success: false,
        message: "닉네임은 한글, 영어, 숫자만 사용할 수 있습니다",
      });
    }

    // 닉네임 중복 체크
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE nickname = $1 AND id != $2",
      [nickname.trim(), user_id]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "이미 사용중인 닉네임입니다",
      });
    }

    // 닉네임 업데이트
    await pool.query("UPDATE users SET nickname = $1 WHERE id = $2", [
      nickname.trim(),
      user_id,
    ]);

    res.status(200).json({
      success: true,
      message: "닉네임이 변경되었습니다",
      data: {
        username: nickname.trim(),
      },
    });
  } catch (error) {
    console.error("닉네임 변경 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

export default router;
