const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Initialize connection using the single URL from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Crucial for Render cloud connections
  }
});

const seedDatabase = async () => {
  try {
    console.log("--- Starting Database Seed ---");

    // Path to your JSON: up from /db/ and down into /data/
    const filePath = path.join(__dirname, '../data/recipes.json');
    
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at ${filePath}. Ensure recipes.json is in the 'data' folder!`);
    }

    const rawData = fs.readFileSync(filePath, 'utf8');
    const recipesObject = JSON.parse(rawData);
    
    // Convert the dictionary (0, 1, 2...) into an array
    const recipes = Object.values(recipesObject);

    console.log(`Successfully read ${recipes.length} recipes from JSON.`);

    // Clear existing data to avoid duplicates
    console.log("Cleaning existing table...");
    await pool.query('TRUNCATE TABLE recipes RESTART IDENTITY');

    // Loop and Insert
    for (let i = 0; i < recipes.length; i++) {
      const recipe = recipes[i];

      const query = `
        INSERT INTO recipes (
          title, cuisine, contient, country_state, url, rating, 
          total_time, prep_time, cook_time, description, 
          ingredients, instructions, nutrients, serves
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `;

      const values = [
        recipe.title,
        recipe.cuisine,
        recipe.Contient,      // Capitalized to match your JSON
        recipe.Country_State,  // Capitalized to match your JSON
        recipe.URL,
        recipe.rating || 0,
        recipe.total_time || 0,
        recipe.prep_time || 0,
        recipe.cook_time || 0,
        recipe.description,
        recipe.ingredients,    
        recipe.instructions,
        recipe.nutrients ? JSON.stringify(recipe.nutrients) : null,
        recipe.serves
      ];

      await pool.query(query, values);

      if ((i + 1) % 20 === 0) {
        console.log(`Progress: ${i + 1}/${recipes.length} recipes uploaded...`);
      }
    }

    console.log("✅ SUCCESS: Database successfully seeded!");

  } catch (err) {
    console.error("❌ ERROR during seed:");
    console.error(err.stack);
  } finally {
    await pool.end();
    console.log("--- Database Connection Closed ---");
  }
};

seedDatabase();