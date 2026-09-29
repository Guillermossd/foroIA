const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const { JWT_SECRET, PORT = 3000, NODE_ENV } = process.env;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error("Falta JWT_SECRET (mínimo 32 caracteres) en server/.env");
  process.exit(1);
}

const app = express();
app.use(express.json({ limit: "20kb" }));
app.use(cookieParser());
// no-cache: el navegador revalida siempre, así nunca usa una versión antigua de un .js o .css
app.use(express.static(path.join(__dirname, "..", "public"), {
  setHeaders: (res) => res.setHeader("Cache-Control", "no-cache"),
}));

const limiter = (max) => rateLimit({ windowMs: 15 * 60 * 1000, max, standardHeaders: true, legacyHeaders: false,
  message: { error: "Demasiados intentos. Inténtalo más tarde." } });
const authLimiter = limiter(30), postLimiter = limiter(40);

const secure = NODE_ENV === "production";
const cookieOpts = { httpOnly: true, sameSite: "lax", secure, maxAge: 7 * 24 * 3600 * 1000 };
const RE_USER = /^[a-zA-Z0-9_]{3,20}$/;
const RE_MAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const str = (v) => (typeof v === "string" ? v.trim() : "");
const DUMMY_HASH = bcrypt.hashSync("dummy-password", 12); // iguala tiempos si el usuario no existe

const sign = (id, username) => jwt.sign({ id, username }, JWT_SECRET, { expiresIn: "7d" });
const readUser = (req) => { try { return jwt.verify(req.cookies.token, JWT_SECRET); } catch { return null; } };
function requireAuth(req, res, next) {
  req.user = readUser(req);
  return req.user ? next() : res.status(401).json({ error: "Debes iniciar sesión." });
}
const fail = (res, code, error) => res.status(code).json({ error });

// ---------- Autenticación ----------
app.post("/api/register", authLimiter, async (req, res) => {
  const username = str(req.body.username);
  const email = str(req.body.email).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  if (!RE_USER.test(username)) return fail(res, 400, "Usuario: 3 a 20 caracteres (letras, números o _).");
  if (!RE_MAIL.test(email) || email.length > 254) return fail(res, 400, "Introduce un email válido.");
  if (password.length < 8 || password.length > 72) return fail(res, 400, "La contraseña debe tener entre 8 y 72 caracteres.");
  try {
    const hash = await bcrypt.hash(password, 12);
    const r = db.prepare("INSERT INTO users(username,email,password_hash) VALUES(?,?,?)").run(username, email, hash);
    res.cookie("token", sign(r.lastInsertRowid, username), cookieOpts).status(201).json({ username });
  } catch (e) {
    if (String(e.code).startsWith("SQLITE_CONSTRAINT")) return fail(res, 409, "Ese usuario o email ya está registrado.");
    console.error(e); fail(res, 500, "Error del servidor.");
  }
});

app.post("/api/login", authLimiter, async (req, res) => {
  const id = str(req.body.identifier).toLowerCase();
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const user = db.prepare("SELECT * FROM users WHERE email = ? OR username = ?").get(id, id);
  const ok = await bcrypt.compare(password, user ? user.password_hash : DUMMY_HASH);
  if (!user || !ok) return fail(res, 401, "Usuario o contraseña incorrectos.");
  res.cookie("token", sign(user.id, user.username), cookieOpts).json({ username: user.username });
});

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure }).json({ ok: true });
});

app.get("/api/me", (req, res) => {
  const u = readUser(req);
  res.json({ user: u ? { username: u.username } : null });
});

// ---------- Subforos y publicaciones ----------
const boardBySlug = db.prepare("SELECT id, slug, name, description, logo FROM boards WHERE slug = ?");

app.get("/api/boards", (req, res) => {
  const boards = db.prepare(`SELECT b.slug, b.name, b.description, b.logo,
      (SELECT COUNT(*) FROM posts p WHERE p.board_id = b.id) AS posts
    FROM boards b ORDER BY b.position`).all();
  res.json({ boards });
});

app.get("/api/boards/:slug", (req, res) => {
  const board = boardBySlug.get(req.params.slug);
  if (!board) return fail(res, 404, "Subforo no encontrado.");
  const posts = db.prepare(`SELECT p.id, p.title, p.body, p.created_at, u.username
    FROM posts p JOIN users u ON u.id = p.user_id
    WHERE p.board_id = ? ORDER BY p.id DESC LIMIT 50`).all(board.id);
  const { id, ...publicBoard } = board;
  res.json({ board: publicBoard, posts });
});

app.post("/api/boards/:slug/posts", postLimiter, requireAuth, (req, res) => {
  const board = boardBySlug.get(req.params.slug);
  if (!board) return fail(res, 404, "Subforo no encontrado.");
  const title = str(req.body.title), body = str(req.body.body);
  if (title.length < 3 || title.length > 120) return fail(res, 400, "El título debe tener entre 3 y 120 caracteres.");
  if (body.length < 1 || body.length > 5000) return fail(res, 400, "El texto debe tener entre 1 y 5000 caracteres.");
  const r = db.prepare("INSERT INTO posts(user_id,board_id,title,body) VALUES(?,?,?,?)").run(req.user.id, board.id, title, body);
  res.status(201).json({ id: r.lastInsertRowid });
});

app.use("/api", (req, res) => fail(res, 404, "Ruta no encontrada."));
app.listen(PORT, () => console.log(`Foro en http://localhost:${PORT}`));
