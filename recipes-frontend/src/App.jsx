import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Layout from "./components/Layout";
import RecipeList from "./components/RecipeList";
import RecipeDetail from "./components/RecipeDetail";
import Favorites from "./components/Favorites";
import Loading from "./components/Loading";
import GalaxyBackground from './components/GalaxyBackground';

function App() {
  const location = useLocation();

  return (
    <>
      <GalaxyBackground /> {/* Fixed background */}
      <Layout>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<RecipeList />} />
            <Route path="/recipes/:id" element={<RecipeDetail />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/loading" element={<Loading />} />
          </Routes>
        </AnimatePresence>
      </Layout>
    </>
  );
}

export default App;