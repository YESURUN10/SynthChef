import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";
import { useFavorites } from "../context/FavoritesContext";

function Layout({ children }) {
  const { favorites } = useFavorites();

  return (
    <div className="container">
      <div className="cursor-glow"></div> {/* Background ambient light */}
      
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="top-nav">
          <div className="nav-brand">
            {/* The new Pro-Level Name */}
            <h1>Synth<span>Chef</span></h1>
          </div>
          <div className="nav-links">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Explorer
            </NavLink>
            <NavLink to="/favorites" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
              Favorites <span className="fav-count">{favorites.length}</span>
            </NavLink>
          </div>
        </nav>
      </motion.header>

      <main>{children}</main>
    </div>
  );
}

export default Layout;