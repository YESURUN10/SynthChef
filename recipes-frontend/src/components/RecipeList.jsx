import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

import RecipeCard from "./RecipeCard";
import Pagination from "./Pagination";
import API_BASE_URL from "../config/api";
import { useDebounce } from "../hooks/useDebounce";

// Skeleton component for loading state
function RecipeSkeleton() {
  return (
    <div className="skeleton-card">
      <div className="skeleton-image"></div>
      <div className="skeleton-content">
        <div className="skeleton-title"></div>
        <div className="skeleton-meta"></div>
        <div className="skeleton-text"></div>
        <div className="skeleton-text short"></div>
      </div>
    </div>
  );
}

function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [totalCount, setTotalCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const pageSizeOptions = [3, 6, 9, 12, 15, 18, 21, 24, 27, 30];

  const [minRating, setMinRating] = useState(0);
  const MAX_TIME_LIMIT = 120;
  const [maxTime, setMaxTime] = useState(MAX_TIME_LIMIT);

  // Filter states - control bar dropdowns
  const [cuisine, setCuisine] = useState("");
  const [contient, setContinent] = useState("");
  const [countryState, setCountryState] = useState("");

  const debouncedSearch = useDebounce(search, 300);

  // ---------------- FETCH FROM BACKEND ----------------
  useEffect(() => {
    const loadRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get(`${API_BASE_URL}/recipes`, {
          params: {
            page,
            limit: pageSize,
          },
        });

        setRecipes(res.data.data);
        
        // BUG FIX: Changed res.data.count to res.data.total
        setTotalCount(res.data.total); 
      } catch (err) {
        console.error(err);
        setError("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadRecipes();
  }, [page, pageSize]);

  // ---------------- EXTRACT UNIQUE VALUES FOR DROPDOWNS ----------------
  const cuisineOptions = useMemo(() => {
    const cuisines = new Set(recipes.map(r => r.cuisine).filter(Boolean));
    return Array.from(cuisines).sort();
  }, [recipes]);

  const continentOptions = useMemo(() => {
    const continents = new Set(recipes.map(r => r.contient).filter(Boolean));
    return Array.from(continents).sort();
  }, [recipes]);

  const countryOptions = useMemo(() => {
    const countries = new Set(recipes.map(r => r.country_state).filter(Boolean));
    return Array.from(countries).sort();
  }, [recipes]);

  // ---------------- CLIENT-SIDE FILTERING ----------------
  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesSearch = recipe.title
        ?.toLowerCase()
        .includes(debouncedSearch.toLowerCase());

      const rating = Number(recipe.rating) || 0;
      const matchesRating = rating >= minRating;

      const time = Number(recipe.total_time) || 0;
      const matchesTime =
        maxTime === MAX_TIME_LIMIT ? true : time <= maxTime;

      // Control bar filters - apply instantly (ignore if empty)
      const matchesCuisine = !cuisine || recipe.cuisine === cuisine;
      const matchesContinent = !contient || recipe.contient === contient;
      const matchesCountry = !countryState || recipe.country_state === countryState;

      return matchesSearch && matchesRating && matchesTime && matchesCuisine && matchesContinent && matchesCountry;
    });
  }, [recipes, debouncedSearch, minRating, maxTime, cuisine, contient, countryState]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, minRating, maxTime, cuisine, contient, countryState, pageSize]);

  // ---------------- UI ----------------
  return (
    <motion.section
      className="recipe-explorer-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* SEARCH + CONTROLS */}
      <div className="search-interface">
        <div className="horizontal-control-bar search-bar-row">
          <input
            className="main-search-input"
            placeholder="Search culinary masterpieces..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="page-size-selector"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </select>

          <button
            className={`filter-toggle-action ${isFilterOpen ? "active" : ""}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            ⚙️ Filters
          </button>
        </div>

        {/* Quick Filter Dropdowns - Control Bar */}
        <div className="horizontal-control-bar filter-bar-row">
          <select
            className="quick-filter-select"
            value={cuisine}
            onChange={(e) => setCuisine(e.target.value)}
          >
            <option value="">All Cuisines</option>
            {cuisineOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="quick-filter-select"
            value={contient}
            onChange={(e) => setContinent(e.target.value)}
          >
            <option value="">All Continents</option>
            {continentOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className="quick-filter-select"
            value={countryState}
            onChange={(e) => setCountryState(e.target.value)}
          >
            <option value="">All Regions</option>
            {countryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              className="filter-dropdown-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="filter-controls-grid">
                <div className="control-box">
                  <label>Min Rating: {minRating} ⭐</label>
                  <input
                    type="range"
                    min="0"
                    max="5"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                  />
                </div>

                <div className="control-box">
                  <label>
                    Max Time:{" "}
                    {maxTime === MAX_TIME_LIMIT ? "120+ mins" : `${maxTime} mins`}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max={MAX_TIME_LIMIT}
                    step="10"
                    value={maxTime}
                    onChange={(e) => setMaxTime(Number(e.target.value))}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* RESULTS */}
      <div className="recipe-results-area">
        {/* Animated Loading Skeleton */}
        {loading && (
          <motion.div 
            className="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[...Array(6)].map((_, i) => (
              <RecipeSkeleton key={i} />
            ))}
          </motion.div>
        )}

        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="grid">
            {filteredRecipes.length > 0 ? (
              filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))
            ) : (
              <p className="empty-state">No recipes found.</p>
            )}
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <Pagination
        page={page}
        setPage={setPage}
        totalItems={totalCount}
        pageSize={pageSize}
      />
    </motion.section>
  );
}

export default RecipeList;
