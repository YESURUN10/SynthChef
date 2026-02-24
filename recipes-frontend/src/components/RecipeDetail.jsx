import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useFavorites } from "../context/FavoritesContext";
import API_BASE_URL from "../config/api";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/recipes/${id}`);
        setRecipe(res.data);
      } catch (err) {
        console.error("Error fetching recipe:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  if (loading) return <div className="loader-screen"><div className="spinner"></div></div>;
  if (!recipe) return <div className="empty-state">Recipe not found.</div>;

  const favorited = isFavorite(recipe.id);

  // Parse nutrients if it's a string
  let nutrients = null;
  if (recipe.nutrients) {
    try {
      nutrients = typeof recipe.nutrients === 'string' 
        ? JSON.parse(recipe.nutrients) 
        : recipe.nutrients;
    } catch (e) {
      console.error("Error parsing nutrients:", e);
    }
  }

  return (
    <motion.div 
      className="detail-wrapper"
      initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
    >
      <button onClick={() => navigate(-1)} className="back-btn">← Back</button>

      <div className="detail-card">
        <header className="detail-header">
          <div className="title-row">
            <h2>{recipe.title}</h2>
            <button 
              className={`fav-action-btn ${favorited ? 'active' : ''}`}
              onClick={() => toggleFavorite(recipe)} 
            >
              {favorited ? "Saved to Favorites ❤️" : "Add to Favorites 🤍"}
            </button>
          </div>
          
          <div className="recipe-meta-grid">
            <div className="meta-item"><span className="meta-label">Cuisine</span><span className="meta-value">{recipe.cuisine || "N/A"}</span></div>
            <div className="meta-item"><span className="meta-label">Continent</span><span className="meta-value">{recipe.contient || "N/A"}</span></div>
            <div className="meta-item"><span className="meta-label">Region</span><span className="meta-value">{recipe.country_state || "N/A"}</span></div>
            <div className="meta-item"><span className="meta-label">Prep Time</span><span className="meta-value">⏱ {recipe.prep_time || "N/A"}m</span></div>
            <div className="meta-item"><span className="meta-label">Cook Time</span><span className="meta-value">🔥 {recipe.cook_time || "N/A"}m</span></div>
            <div className="meta-item"><span className="meta-label">Total Time</span><span className="meta-value">⏱ {recipe.total_time || "N/A"}m</span></div>
            <div className="meta-item"><span className="meta-label">Serves</span><span className="meta-value">👥 {recipe.serves || "N/A"}</span></div>
            <div className="meta-item full-width"><span className="meta-label">Rating</span><span className="meta-value">⭐ {recipe.rating || "No rating"}</span></div>
          </div>
        </header>

        {recipe.description && (
          <div className="recipe-description">{recipe.description}</div>
        )}

        <div className="recipe-content">
          <section className="recipe-section">
            <h4>Ingredients</h4>
            <ul className="ingredient-list">
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))
              ) : (
                <li className="empty-data">No ingredients listed</li>
              )}
            </ul>
          </section>

          <section className="recipe-section">
            <h4>Instructions</h4>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <ol className="instructions-list">
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="method-text">
                Follow the chef's precise instructions to recreate this {recipe.cuisine || "culinary"} masterpiece. Ensure all ingredients are at room temperature before beginning the preparation.
              </p>
            )}
          </section>

          {nutrients && (
            <section className="recipe-section nutrients-section">
              <h4>Nutritional Information</h4>
              <div className="nutrients-grid">
                {Object.entries(nutrients).map(([key, value]) => (
                  <div key={key} className="nutrient-item">
                    <span className="nutrient-label">{key.replace(/_/g, ' ')}</span>
                    <span className="nutrient-value">{String(value)}</span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default RecipeDetail;
