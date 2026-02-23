// src/components/RecipeList.jsx
import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import RecipeCard from "./RecipeCard";
import Pagination from "./Pagination";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "../hooks/useDebounce";

function RecipeList() {
  const [allRecipes, setAllRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [minRating, setMinRating] = useState(0);
  
  const MAX_TIME_LIMIT = 120;
  const [maxTime, setMaxTime] = useState(MAX_TIME_LIMIT); 

  // PRO FEATURE: Dynamic Page Size (Default 9)
  const [pageSize, setPageSize] = useState(9);
  const pageSizeOptions = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];

  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const res = await axios.get("http://localhost:5000/recipes");
        const data = res.data.data || res.data;
        setAllRecipes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecipes = useMemo(() => {
    return allRecipes.filter(recipe => {
      const matchesSearch = recipe.title?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const recipeRating = parseFloat(String(recipe.rating).replace(/[^\d.]/g, "")) || 0;
      const matchesRating = minRating === 0 ? true : recipeRating >= minRating;
      const recipeTime = Number(recipe.total_time) || 0;
      const matchesTime = maxTime === MAX_TIME_LIMIT ? true : recipeTime <= maxTime;

      return matchesSearch && matchesRating && matchesTime;
    });
  }, [allRecipes, debouncedSearch, minRating, maxTime]);

  // Reset to page 1 if search, filters, or PAGE SIZE changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, minRating, maxTime, pageSize]);

  const paginatedRecipes = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRecipes.slice(start, start + pageSize);
  }, [filteredRecipes, page, pageSize]);

  return (
    <motion.section 
      className="recipe-explorer-container"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="search-interface">
        <div className="horizontal-control-bar">
          <div className="search-field-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search culinary masterpieces..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="main-search-input"
            />
          </div>

          {/* THE NEW DROPDOWN: Placed right next to the filter button */}
          <div className="page-size-wrapper">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="page-size-selector"
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>{size} per page</option>
              ))}
            </select>
          </div>

          <button 
            className={`filter-toggle-action ${isFilterOpen ? "active" : ""}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            ⚙️ {isFilterOpen ? "Close" : "Filter"}
          </button>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="filter-dropdown-drawer"
              initial={{ opacity: 0, y: -15, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -15, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="filter-controls-inner">
                <div className="control-box">
                  <label>Minimum Rating: {minRating} ⭐</label>
                  <input
                    type="range" min="0" max="5" step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  />
                </div>
                <div className="control-box">
                  <label>Max Prep Time: {maxTime === MAX_TIME_LIMIT ? '120+ mins' : `${maxTime} mins`}</label>
                  <input
                    type="range" min="10" max={MAX_TIME_LIMIT} step="10"
                    value={maxTime}
                    onChange={(e) => setMaxTime(Number(e.target.value))}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="recipe-results-area">
        {loading ? (
          <div className="loader-screen">
            <div className="spinner"></div>
            <p>Fetching Culinary Matrix...</p>
          </div>
        ) : (
          <div className="grid">
            <AnimatePresence mode="popLayout">
              {paginatedRecipes.length > 0 ? (
                paginatedRecipes.map(recipe => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))
              ) : (
                <motion.div className="empty-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h3>No recipes found</h3>
                  <p>Try expanding your search or adjusting filters.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {filteredRecipes.length > 0 && (
        <Pagination page={page} setPage={setPage} totalItems={filteredRecipes.length} pageSize={pageSize} />
      )}
    </motion.section>
  );
}

export default RecipeList;