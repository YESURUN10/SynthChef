import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { useFavorites } from "../context/FavoritesContext";

function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const { isFavorite, toggleFavorite } = useFavorites();

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/recipes/${id}`)
      .then(res => {
        setRecipe(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching recipe:", err);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="loader-screen"><div className="spinner"></div></div>;
  if (!recipe) return <div className="empty-state">Recipe not found.</div>;

  const favorited = isFavorite(recipe.id);

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
            <div className="meta-item"><span className="meta-label">Cuisine</span><span className="meta-value">{recipe.cuisine}</span></div>
            <div className="meta-item"><span className="meta-label">Time</span><span className="meta-value">⏱ {recipe.total_time}m</span></div>
            <div className="meta-item"><span className="meta-label">Serves</span><span className="meta-value">👥 {recipe.serves}</span></div>
            <div className="meta-item"><span className="meta-label">Rating</span><span className="meta-value">⭐ {recipe.rating}</span></div>
          </div>
        </header>

        <div className="recipe-description">{recipe.description}</div>

        <div className="recipe-content">
          <section className="recipe-section">
            <h4>Ingredients</h4>
            <ul className="ingredient-list">
               {recipe.ingredients ? recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>) : (
                 <><li>Premium organic ingredients</li><li>Signature spices</li><li>Fresh herbs</li></>
               )}
            </ul>
          </section>

          <section className="recipe-section">
            <h4>Method</h4>
            <p className="method-text">
              Follow the chef's precise instructions to recreate this {recipe.cuisine} masterpiece. Ensure all ingredients are at room temperature before beginning the preparation.
            </p>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

export default RecipeDetail;