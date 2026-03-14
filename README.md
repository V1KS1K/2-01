# Frontend & Backend Development Practice

### 🛠 Стек технологий

*   **Backend:** Node.js, Express, Swagger (OpenAPI 3.0), Bcrypt (хеширование), JSON Web Tokens (JWT).
*   **Frontend:** React, Sass (SCSS), Axios (Interceptors для работы с токенами).

### 📁 Структура проекта

* `Backend` — Серверная часть приложения (База данных товаров, маршруты и Swagger).
* `Frontend` — Лицевая часть сайта
* `Practice-3.docx` - Скриншоты из Postman Практического занятия 3


### 🚀 Как запустить Итоговый проект (Практика 4-5)

Проект состоит из двух частей: Сервер (Backend) и Клиент (Frontend). Их нужно запускать параллельно в разных терминалах.

#### 1. Запуск Сервера (Backend + Swagger)

Сервер отвечает за базу данных товаров и автоматическую документацию API (Swagger).

```bash
cd Practice 1
npm install
node app.js
```

#### 2. Запуск Клиента (Frontend)
```bash
cd client
npm install
npm start
