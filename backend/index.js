import express from "express";
import cors from "cors";
import pool from "./db.js";
import authRouter from "./routes/auth.js";
import scoresRouter from "./routes/scores.js";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import connectPgSimple from "connect-pg-simple";
import rateLimit from "express-rate-limit";

const PgSession = connectPgSimple(session);
const app = express();
const port = 3000;

// 필수 환경변수 검증
const requiredEnvVars = ["FRONTEND_URL", "SESSION_SECRET", "DATABASE_URL"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`${envVar} 환경변수가 설정되지 않았습니다.`);
    console.error(".env.example 파일을 참고하여 .env 파일을 생성해주세요.");
    process.exit(1);
  }
}

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true, // 쿠키 허용
  })
); // CORS 미들웨어

// Rate Limiting 설정
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 5, // 15분 동안 최대 5번 시도
  message: {
    success: false,
    message: "너무 많은 로그인 시도입니다. 15분 후 다시 시도해주세요.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100, // 15분 동안 최대 100번 요청
  message: {
    success: false,
    message: "너무 많은 요청입니다. 잠시 후 다시 시도해주세요.",
  },
});

app.use(generalLimiter); // 전체 API에 적용
app.use(express.json()); // JSON 파싱 미들웨어

// 세션 미들웨어를 passport 전에 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false, // 유저가 서버로 요청할 때마다 세션 갱신할것인지 여부
    saveUninitialized: false, // 로그인 안 해도 세션 만들것인지 여부
    cookie: {
      maxAge: 60 * 60 * 1000, // 세션 유지 시간 (1시간)
      secure: process.env.NODE_ENV === "production", // HTTPS에서만 쿠키 전송
      httpOnly: true, // XSS 방지
      sameSite: "lax", // CSRF 방지
    },
    store: new PgSession({
      pool: pool,
      tableName: "session",
    }),
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

      // 아이디 확인
      if (result.rows.length === 0) {
        return cb(null, false, { message: "아이디 DB에 없음" });
      }
      // 비밀번호 확인
      if (await bcrypt.compare(password, result.rows[0].password)) {
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

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

app.use("/auth", authLimiter, authRouter); // 인증 API에 더 엄격한 제한
app.use("/scores", scoresRouter);
