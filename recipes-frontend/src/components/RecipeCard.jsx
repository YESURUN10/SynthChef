// src/components/RecipeCard.jsx
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useFavorites } from "../context/FavoritesContext";

// Curated Unsplash cinematic culinary photography
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1484723091798-dd2d4ab1702f?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1490818387583-1b0ba6f91f36?auto=format&fit=crop&w=800&q=80"
];

// PRO-LEVEL ID CONVERTER: Handles both Numbers and MongoDB String IDs
export const getDeterministicImage = (id) => {
  if (!id) return FALLBACK_IMAGES[0];
  
  let numId = 0;
  if (typeof id === 'string') {
    for (let i = 0; i < id.length; i++) {
      numId += id.charCodeAt(i);
    }
  } else if (typeof id === 'number') {
    numId = id;
  }
  
  return FALLBACK_IMAGES[numId % FALLBACK_IMAGES.length];
};

function RecipeCard({ recipe }) {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite(recipe.id);

  // Fetch the guaranteed image
  const heroImage = getDeterministicImage(recipe.id);

  const handleCardClick = (e) => {
    // Prevent navigation if they just clicked the heart button
    if (e.target.closest('.quick-fav-btn')) return;
    navigate(`/recipes/${recipe.id}`);
  };

  return (
    <motion.div
      className="card" layout
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -8, scale: 1.02 }}
      onClick={handleCardClick}
    >
      <div 
        className="card-image-hero" 
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="card-gradient-overlay"></div>
        
        <div className="card-top-row">
          <span className="badge">{recipe.cuisine || "Fusion"}</span>
          <button 
            className={`quick-fav-btn ${favorited ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation(); // Double protection against card click
              toggleFavorite(recipe);
            }}
          >
            {favorited ? '❤️' : '🤍'}
          </button>
        </div>

        <h3 className="card-hero-title">{recipe.title}</h3>
      </div>
      
      <div className="card-stats">
        <p>⭐ {recipe.rating || "New"}</p>
        <p>⏱ {recipe.total_time || "45"}m</p>
      </div>
    </motion.div>
  );
}

export default RecipeCard;