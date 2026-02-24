// Load environment variables
require("dotenv").config();

// Core imports
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

// App setup
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool (Render-safe)
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: {
    rejectUnauthorized: false, // REQUIRED for Render
  },
});

// -------------------- ROUTES --------------------

// Health check
app.get("/", (req, res) => {
  res.send("Recipes API is running");
});

// GET recipes with backend pagination (MAX 30 per page)
app.get("/recipes", async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);

  let limit = parseInt(req.query.limit) || 12;
  if (limit > 30) limit = 30;     // HARD CAP
  if (limit < 1) limit = 12;

  const offset = (page - 1) * limit;

  try {
    const dataResult = await pool.query(
      "SELECT * FROM recipes ORDER BY id LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM recipes"
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: dataResult.rows,
    });
  } catch (err) {
    console.error("Error fetching recipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// GET recipe by ID
app.get("/recipes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "SELECT * FROM recipes WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Recipe not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching recipe:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Search recipes by cuisine (paginated + capped)
app.get("/recipes/search", async (req, res) => {
  const { cuisine } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);

  let limit = parseInt(req.query.limit) || 12;
  if (limit > 30) limit = 30;
  if (limit < 1) limit = 12;

  const offset = (page - 1) * limit;

  if (!cuisine) {
    return res.status(400).json({ error: "Cuisine query is required" });
  }

  try {
    const dataResult = await pool.query(
      "SELECT * FROM recipes WHERE cuisine ILIKE $1 ORDER BY id LIMIT $2 OFFSET $3",
      [`%${cuisine}%`, limit, offset]
    );

    const countResult = await pool.query(
      "SELECT COUNT(*) FROM recipes WHERE cuisine ILIKE $1",
      [`%${cuisine}%`]
    );

    const total = parseInt(countResult.rows[0].count);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: dataResult.rows,
    });
  } catch (err) {
    console.error("Error searching recipes:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- START SERVER --------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});