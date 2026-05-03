import express from "express";
import { createServer as createViteServer } from "vite";
import pg from "pg";
const { Pool } = pg;
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection pool
// PostgreSQL connection pool
// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Supabase always needs SSL
});

// Initialize Database Tables
async function initDB() {
  try {
    // Test connection first
    await pool.query("SELECT 1");
    console.log("✅ Database connected successfully");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE,
        password TEXT,
        name TEXT
      );

      CREATE TABLE IF NOT EXISTS subjects (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name TEXT,
        priority INTEGER DEFAULT 1,
        color TEXT
      );

      CREATE TABLE IF NOT EXISTS exams (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subject_id INTEGER REFERENCES subjects(id),
        exam_date TEXT,
        description TEXT
      );

      CREATE TABLE IF NOT EXISTS study_plans (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        plan_data TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        subject_id INTEGER REFERENCES subjects(id),
        title TEXT,
        due_date TEXT,
        completed INTEGER DEFAULT 0,
        duration_minutes INTEGER
      );
    `);
    console.log("✅ Database tables ready");
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    process.exit(1); // Stop server if DB fails
  }
}

async function startServer() {
  await initDB();

  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // --- Auth ---
  app.post("/api/auth/signup", async (req, res) => {
    const { email, password, name } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name",
        [email, password, name]
      );
      res.json(result.rows[0]);
    } catch (err) {
      res.status(400).json({ error: "User already exists or invalid data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE email = $1 AND password = $2",
      [email, password]
    );
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(401).json({ error: "Invalid credentials" });
    }
  });

  // --- Subjects ---
  app.get("/api/subjects", async (req, res) => {
    const { userId } = req.query;
    const result = await pool.query("SELECT * FROM subjects WHERE user_id = $1", [userId]);
    res.json(result.rows);
  });

  app.post("/api/subjects", async (req, res) => {
    const { userId, name, priority, color } = req.body;
    const result = await pool.query(
      "INSERT INTO subjects (user_id, name, priority, color) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, name, priority, color]
    );
    res.json(result.rows[0]);
  });

  // --- Exams ---
  app.get("/api/exams", async (req, res) => {
    const { userId } = req.query;
    const result = await pool.query(`
      SELECT exams.*, subjects.name as subject_name 
      FROM exams 
      JOIN subjects ON exams.subject_id = subjects.id 
      WHERE exams.user_id = $1
    `, [userId]);
    res.json(result.rows);
  });

  app.post("/api/exams", async (req, res) => {
    const { userId, subjectId, examDate, description } = req.body;
    const result = await pool.query(
      "INSERT INTO exams (user_id, subject_id, exam_date, description) VALUES ($1, $2, $3, $4) RETURNING *",
      [userId, subjectId, examDate, description]
    );
    res.json(result.rows[0]);
  });

  // --- Tasks ---
  app.get("/api/tasks", async (req, res) => {
    const { userId } = req.query;
    const result = await pool.query(`
      SELECT tasks.*, subjects.name as subject_name, subjects.color as subject_color
      FROM tasks 
      JOIN subjects ON tasks.subject_id = subjects.id 
      WHERE tasks.user_id = $1
    `, [userId]);
    res.json(result.rows);
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    await pool.query("UPDATE tasks SET completed = $1 WHERE id = $2", [completed ? 1 : 0, id]);
    res.json({ success: true });
  });

  app.post("/api/tasks/bulk", async (req, res) => {
    const { userId, tasks } = req.body;
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const task of tasks) {
        await client.query(
          "INSERT INTO tasks (user_id, subject_id, title, due_date, duration_minutes) VALUES ($1, $2, $3, $4, $5)",
          [userId, task.subjectId, task.title, task.dueDate, task.durationMinutes]
        );
      }
      await client.query("COMMIT");
      res.json({ success: true });
    } catch (err) {
      await client.query("ROLLBACK");
      res.status(500).json({ error: "Failed to insert tasks" });
    } finally {
      client.release();
    }
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(3000, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

startServer();