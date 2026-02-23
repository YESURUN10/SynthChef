// Load environment variables from .env
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

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// -------------------- ROUTES --------------------

// Health check
app.get("/", (req, res) => {
  res.send("Recipes API is running");
});

// GET ALL recipes (Unlocked for Client-Side Pagination)
app.get("/recipes", async (req, res) => {
  try {
    // PRO FIX: Removed LIMIT and OFFSET to send the full database to React
    const result = await pool.query(
      "SELECT * FROM recipes ORDER BY id"
    );

    res.json({
      count: result.rows.length,
      data: result.rows,
    });
  } catch (err) {
    console.error(err);
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
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Search recipes by cuisine
app.get("/recipes/search", async (req, res) => {
  const { cuisine } = req.query;

  if (!cuisine) {
    return res.status(400).json({ error: "Cuisine query is required" });
  }

  try {
    // PRO FIX: Removed "LIMIT 20" from the search query as well
    const result = await pool.query(
      "SELECT * FROM recipes WHERE cuisine ILIKE $1",
      [`%${cuisine}%`]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// -------------------- START SERVER --------------------

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});