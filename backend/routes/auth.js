import express from "express";
import pool from "../db.js";
import passport from "passport";
import bcrypt from "bcrypt";

const router = express.Router();

// 회원가입
router.post("/signup", async (req, res) => {
  console.log("=== /auth/signup 요청 받음 ===");
  console.log("req.body:", req.body);

  try {
    const { username, password } = req.body;

    // 해싱
    let hashPW = await bcrypt.hash(password, 10);

    // 사용자 중복 체크
    const existingUser = await pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "이미 존재하는 사용자입니다",
      });
    }

    // 새 사용자 삽입
    const result = await pool.query(
      "INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username",
      [username, hashPW]
    );

    const newUser = result.rows[0];

    // 회원가입 성공 후 자동 로그인
    req.logIn(newUser, (err) => {
      if (err) {
        console.error("자동 로그인 실패:", err);
        return res.status(500).json({
          success: false,
          message: "회원가입은 성공했으나 로그인 실패"
        });
      }

      res.status(201).json({
        success: true,
        message: "회원가입 및 로그인 성공",
        data: {
          user: {
            id: newUser.id,
            username: newUser.username,
          },
        },
      });
    });
  } catch (error) {
    console.error("회원가입 오류:", error);
    res.status(500).json({
      success: false,
      message: "서버 오류가 발생했습니다",
    });
  }
});

// 로그인
router.post("/login", (req, res, next) => {
  console.log("=== /auth/login 요청 받음 ===");
  console.log("req.body:", req.body);

  // db 비교 작업 후
  passport.authenticate("local", (error, user, info) => {
    if (error) return res.status(500).json(error);
    if (!user) return res.status(401).json(info.message);

    req.logIn(user, (err) => {
      if (err) return next(err);

      res.json({
        success: true,
        data: {
          user: { id: user.id, username: user.username },
        },
      });
    });
  })(req, res, next);
});

// 현재 사용자 정보 조회
router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user.id,
          username: req.user.username,
        },
      },
    });
  } else {
    res.status(401).json({
      success: false,
      message: "로그인이 필요합니다",
    });
  }
});

// 로그아웃
router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: "로그아웃 실패" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res
          .status(500)
          .json({ success: false, error: "세션 삭제 실패" });
      }
      res.clearCookie("connect.sid"); // 기본 세션 쿠키 이름
      res.json({ success: true, message: "로그아웃 성공" });
    });
  });
});

export default router;
