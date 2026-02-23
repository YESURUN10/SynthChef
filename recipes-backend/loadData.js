const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// PostgreSQL connection
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "recipes_db",
  password: "YS", // <-- CHANGE THIS
  port: 5432,
});

// Read JSON file
const filePath = path.join(__dirname, "data", "recipes.json");
const rawData = fs.readFileSync(filePath, "utf-8");

// IMPORTANT FIX:
// JSON is an object with keys "0", "1", "2", ...
// Convert it into an array
const recipes = Object.values(JSON.parse(rawData));

async function loadData() {
  await client.connect();

  const insertQuery = `
    INSERT INTO recipes
    (id, title, cuisine, rating, prep_time, cook_time, total_time, description, nutrients, serves)
    VALUES
    ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    ON CONFLICT (id) DO NOTHING
  `;

  let id = 1;

  for (const r of recipes) {
    await client.query(insertQuery, [
      id++,                              // generated ID
      r.title || null,
      r.cuisine || null,
      isNaN(r.rating) ? null : r.rating,
      isNaN(r.prep_time) ? null : r.prep_time,
      isNaN(r.cook_time) ? null : r.cook_time,
      isNaN(r.total_time) ? null : r.total_time,
      r.description || null,
      r.nutrients || null,
      r.serves || null,
    ]);
  }

  await client.end();
  console.log("Data loaded successfully");
}

// Run the loader
loadData().catch((err) => {
  console.error("Error loading data:", err);
});
