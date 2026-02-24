-- schema.sql

DROP TABLE IF EXISTS recipes;

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    recipe_index INTEGER, -- To store the JSON key (0, 1, 2, etc.)
    title TEXT NOT NULL,
    cuisine TEXT,
    contient TEXT,
    country_state TEXT,
    url TEXT,
    rating DECIMAL,
    total_time INTEGER,
    prep_time INTEGER,
    cook_time INTEGER,
    description TEXT,
    ingredients TEXT[], -- Stores as a PostgreSQL Array
    instructions TEXT[], -- Stores as a PostgreSQL Array
    nutrients JSONB, -- Stores the entire nutrients object for flexibility
    serves TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);