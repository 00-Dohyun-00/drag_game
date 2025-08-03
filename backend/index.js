import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRouter from "./routes/auth.js";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";

const app = express();
const port = 3000;

app.use(cors({
  origin: 'http://localhost:5173', // 프론트엔드 URL
  credentials: true // 쿠키 허용
})); // CORS 미들웨어
app.use(express.json()); // JSON 파싱 미들웨어

// 세션 미들웨어를 passport 전에 설정
app.use(
  session({
    secret: "암호화에 쓸 비번",
    resave: false, // 유저가 서버로 요청할 때마다 세션 갱신할것인지 여부
    saveUninitialized: false, // 로그인 안 해도 세션 만들것인지 여부
    cookie: { maxAge: 60 * 60 * 1000 }, // 세션 유지 시간 (1시간)
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Passport LocalStrategy 설정
passport.use(
  new LocalStrategy(async (username, password, cb) => {
    console.log("LocalStrategy 호출됨:", username, password);
    try {
      const result = await pool.query(
        'SELECT * FROM "users" WHERE "username" = $1',
        [username]
      );
      console.log("DB 쿼리 결과:", result.rows);
      if (result.rows.length === 0) {
        return cb(null, false, { message: "아이디 DB에 없음" });
      }
      if (result.rows[0].password === password) {
        return cb(null, result.rows[0]);
      } else {
        return cb(null, false, { message: "비번불일치" });
      }
    } catch (err) {
      console.log("DB 에러:", err);
      return cb(err);
    }
  })
);

// 로그인시 세션 제작
passport.serializeUser((user, done) => {
  console.log("serializeUser 호출됨:", user);
  done(null, { id: user.id, username: user.username });
});

// 유저가 보낸 쿠키(세션 아이디 담긴) 분석
passport.deserializeUser(async (user, done) => {
  console.log("deserializeUser 호출됨:", user);
  try {
    const result = await pool.query(
      'SELECT id, username FROM "users" WHERE id = $1',
      [user.id]
    );
    console.log("result", result);
    if (result.rows.length > 0) {
      console.log("result.rows", result.rows);
      done(null, result.rows[0]); // password 제외하고 반환
    } else {
      done(null, false);
    }
  } catch (err) {
    done(err);
  }
});

app.get("/", async (req, res) => {
  const result = await pool.query("SELECT NOW()");
  res.send(`PostgreSQL 연결됨: ${result.rows[0].now}`);
});

app.get("/test-db", async (req, res) => {
  console.log("=== /test-db 요청 받음 ===");
  console.log("req.user:", req.user);
  console.log("req.isAuthenticated():", req.isAuthenticated());
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

app.use("/auth", authRouter);
