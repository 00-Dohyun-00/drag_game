import express from "express";
import pool from "../db.js";

const router = express.Router();

// 한마디 저장
router.post("/save_comment", async (req, res) => {
  console.log("=== /comments/save_comment 요청 받음 ===");
  console.log("req.body:", req.body);

  try {
    const { user_id, text } = req.body;

    // 입력 검증
    if (!user_id || !text) {
      return res.status(400).json({
        success: false,
        message: "사용자 ID와 텍스트는 필수입니다",
      });
    }

    // 텍스트 길이 검증 (50자 제한)
    if (text.length > 50) {
      return res.status(400).json({
        success: false,
        message: "텍스트는 50자를 초과할 수 없습니다",
      });
    }

    // HTML/스크립트 태그 검증 (기본적인 XSS 방지)
    const dangerousPatterns = [
      /<script[\s\S]*?<\/script>/gi,
      /<iframe[\s\S]*?<\/iframe>/gi,
      /<object[\s\S]*?<\/object>/gi,
      /<embed[\s\S]*?>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi, // onclick, onload 등
    ];

    const containsDangerousCode = dangerousPatterns.some((pattern) =>
      pattern.test(text)
    );

    if (containsDangerousCode) {
      return res.status(400).json({
        success: false,
        message: "허용되지 않는 코드가 포함되어 있습니다",
      });
    }

    // 한마디 삽입
    const result = await pool.query(
      "INSERT INTO comments (user_id, text, created_at) VALUES ($1, $2, NOW() AT TIME ZONE 'Asia/Seoul') RETURNING *",
      [user_id, text.trim()]
    );

    const savedComment = result.rows[0];

    res.status(200).json({
      success: true,
      message: "한마디 저장 성공",
      data: {
        comment: {
          id: savedComment.id,
          user_id: savedComment.user_id,
          text: savedComment.text,
          created_at: savedComment.created_at,
        },
      },
    });
  } catch (error) {
    console.error("한마디 저장 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 한마디 조회
router.get("/get_comment", async (req, res) => {
  console.log("=== /comments/get_comment 요청 받음 ===");

  /**
   * TODO: 페이지네이션
   */

  try {
    // 모든 코멘트를 시간순(최신순)으로 조회 + 사용자 정보 JOIN
    const commentResult = await pool.query(
      `SELECT 
        c.id,
        c.user_id, 
        c.text, 
        c.created_at,
        u.username
      FROM comments c
      JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC`
    );

    const comments = commentResult.rows.map((comment) => ({
      id: comment.id,
      user_id: comment.user_id,
      username: comment.username,
      text: comment.text,
      created_at: comment.created_at,
    }));

    res.status(200).json({
      success: true,
      message: "한마디 조회 성공",
      data: {
        comments: comments,
      },
    });
  } catch (error) {
    console.error("한마디 조회 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 한마디 삭제
router.delete("/delete_comment", async (req, res) => {
  console.log("=== /comments/delete_comment 요청 받음 ===");

  try {
    const { user_id, comment_id } = req.body;

    // 입력 검증
    if (!comment_id || !user_id) {
      return res.status(400).json({
        success: false,
        message: "파라미터 확인",
      });
    }

    // 댓글 존재 여부 및 소유자 확인
    const commentCheck = await pool.query(
      "SELECT user_id FROM comments WHERE id = $1",
      [comment_id]
    );

    if (commentCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "해당 글을 찾을 수 없습니다",
      });
    }

    // 글 작성자와 삭제 요청자가 같은지 확인
    const commentOwnerId = commentCheck.rows[0].user_id;
    if (commentOwnerId !== parseInt(user_id)) {
      return res.status(403).json({
        success: false,
        message: "본인이 작성한 글만 삭제할 수 있습니다",
      });
    }

    // 글 삭제
    await pool.query("DELETE FROM comments WHERE id = $1", [comment_id]);

    res.status(200).json({
      success: true,
      message: "댓글이 성공적으로 삭제되었습니다",
    });
  } catch (error) {
    console.error("댓글 삭제 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

export default router;
