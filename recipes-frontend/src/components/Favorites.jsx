import { motion, AnimatePresence } from "framer-motion";
import RecipeCard from "./RecipeCard";
import { useFavorites } from "../context/FavoritesContext";

function Favorites() {
  const { favorites } = useFavorites();

  return (
    <motion.div 
      className="recipe-explorer-container"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="favorites-header">
        <h2>Your Culinary Collection</h2>
        <p>Recipes you've saved for later</p>
      </div>
      
      {favorites.length === 0 ? (
        <motion.div className="empty-state" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
          <h3>Your plate is empty</h3>
          <p>Go to the Explorer to find recipes you love!</p>
        </motion.div>
      ) : (
        <div className="grid">
          <AnimatePresence mode="popLayout">
            {favorites.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export default Favorites;