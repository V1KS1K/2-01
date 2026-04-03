const express = require("express");
const cors = require("cors");
const { nanoid } = require("nanoid");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const ACCESS_SECRET = "access_secret_123";
const REFRESH_SECRET = "refresh_secret_456";

let users = []; 
let products = [
  { id: "1", title: "UV/LED Лампа 48W", category: "Оборудование", price: 2500, description: "Профессиональная лампа" },
  { id: "2", title: "Аппарат Strong 210", category: "Оборудование", price: 12500, description: "Мощный фрезер" }
];
const refreshTokens = new Set();

// --- Swagger Настройка ---
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: { title: "Nail Store Professional API", version: "1.5.0" },
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }
      }
    }
  },
  apis: ["./app.js"],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// --- Токены ---
const genAt = (u) => jwt.sign({ sub: u.id, email: u.email, role: u.role, username: u.username }, ACCESS_SECRET, { expiresIn: '15m' });
const genRt = (u) => jwt.sign({ sub: u.id, email: u.email, role: u.role, username: u.username }, REFRESH_SECRET, { expiresIn: '7d' });

// --- Middleware ---
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) return res.status(401).json({ error: "Требуется авторизация" });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET);
    next();
  } catch (err) { res.status(401).json({ error: "Токен невалиден" }); }
}

function roleMiddleware(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: "Нет доступа" });
    }
    next();
  };
}

// ==========================================
// 1. AUTH
// ==========================================

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Регистрация (Email, Username, Password)
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               username: { type: string }
 *               password: { type: string }
 *               role: { type: string, example: "user" }
 *     responses: { 201: { description: OK } }
 */
app.post("/api/auth/register", async (req, res) => {
  const { email, username, password, role } = req.body;
  if (!email || !username || !password) return res.status(400).json({ error: "Все поля обязательны" });
  const hash = await bcrypt.hash(password, 10);
  const u = { id: nanoid(), email, username, passwordHash: hash, role: role || "user" };
  users.push(u);
  res.status(201).json({ id: u.id, email: u.email, username: u.username, role: u.role });
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Вход
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *               password: { type: string }
 *     responses: { 200: { description: OK } }
 */
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) return res.status(401).json({ error: "Ошибка" });
  const at = genAt(user); const rt = genRt(user);
  refreshTokens.add(rt);
  res.json({ accessToken: at, refreshToken: rt, user: { email: user.email, role: user.role, username: user.username } });
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Обновить токены
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses: { 200: { description: OK } }
 */
app.post("/api/auth/refresh", (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshTokens.has(refreshToken)) return res.status(401).send();
  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET);
    const user = users.find(u => u.id === payload.sub);
    refreshTokens.delete(refreshToken);
    const at = genAt(user); const rt = genRt(user);
    refreshTokens.add(rt);
    res.json({ accessToken: at, refreshToken: rt });
  } catch (e) { res.status(401).send(); }
});

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Мой профиль (Нужен токен)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
app.get("/api/auth/me", authMiddleware, (req, res) => {
  const u = users.find(x => x.id === req.user.sub);
  res.json(u);
});

// ==========================================
// 2. USERS (ADMIN ONLY)
// ==========================================

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Список всех (Админ)
 *     security: [{ bearerAuth: [] }]
 *     responses: { 200: { description: OK } }
 */
app.get("/api/users", authMiddleware, roleMiddleware(["admin"]), (req, res) => res.json(users));

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Получить одного (Админ)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id }]
 *     responses: { 200: { description: OK } }
 */
app.get("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  res.json(users.find(u => u.id === req.params.id));
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Обновить юзера/роль (Админ)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role: { type: string }
 *               username: { type: string }
 *     responses: { 200: { description: OK } }
 */
app.put("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  const i = users.findIndex(u => u.id === req.params.id);
  if (i === -1) return res.status(404).send();
  users[i] = { ...users[i], ...req.body };
  res.json(users[i]);
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Удалить юзера (Админ)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id }]
 *     responses: { 204: { description: OK } }
 */
app.delete("/api/users/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  users = users.filter(u => u.id !== req.params.id);
  res.status(204).send();
});

// ==========================================
// 3. PRODUCTS (Публичные GET)
// ==========================================

/**
 * @swagger
 * /api/products:
 *   get:
 *     tags: [Products]
 *     summary: Список товаров (Публично)
 *     responses: { 200: { description: OK } }
 */
app.get("/api/products", (req, res) => res.json(products));

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Товар по ID (Публично)
 *     parameters: [{ in: path, name: id }]
 *     responses: { 200: { description: OK } }
 */
app.get("/api/products/:id", (req, res) => {
  const p = products.find(x => x.id === req.params.id);
  p ? res.json(p) : res.status(404).send();
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     tags: [Products]
 *     summary: Создать (Продавец)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: string }
 *               price: { type: number }
 *     responses: { 201: { description: OK } }
 */
app.post("/api/products", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
  const p = { id: nanoid(6), ...req.body };
  products.push(p);
  res.status(201).json(p);
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     tags: [Products]
 *     summary: Обновить (Продавец)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id }]
 *     responses: { 200: { description: OK } }
 */
app.put("/api/products/:id", authMiddleware, roleMiddleware(["seller", "admin"]), (req, res) => {
  const i = products.findIndex(x => x.id === req.params.id);
  products[i] = { ...products[i], ...req.body };
  res.json(products[i]);
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Удалить (Админ)
 *     security: [{ bearerAuth: [] }]
 *     parameters: [{ in: path, name: id }]
 *     responses: { 204: { description: OK } }
 */
app.delete("/api/products/:id", authMiddleware, roleMiddleware(["admin"]), (req, res) => {
  products = products.filter(x => x.id !== req.params.id);
  res.status(204).send();
});

app.listen(PORT, () => console.log(`БЭКЕНД ГОТОВ: http://localhost:${PORT}`));