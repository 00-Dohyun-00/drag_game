import express from "express";
import pool from "../db.js";
import passport from "passport";

const router = express.Router();

router.post("/signup", (req, res) => {
  // 회원가입 로직
});

router.post("/login", (req, res, next) => {
  console.log("=== /auth/login 요청 받음 ===");
  console.log("req.body:", req.body);

  // db 비교 작업 후
  passport.authenticate("local", (error, user, info) => {
    if (error) return res.status(500).json(error);
    if (!user) return res.status(401).json(info.message);
    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log("로그인 후 req.user :", req.user);
      console.log("로그인한 user 객체:", user);
      console.log("req.session:", req.session);
      res.json({
        success: true,
        data: {
          user: { id: user.id, username: user.username }
        }
      });
    });
  })(req, res, next);
});

router.post("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ success: false, error: "로그아웃 실패" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, error: "세션 삭제 실패" });
      }
      res.clearCookie('connect.sid'); // 기본 세션 쿠키 이름
      res.json({ success: true, message: "로그아웃 성공" });
    });
  });
});

export default router;
