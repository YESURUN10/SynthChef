import { motion } from "framer-motion";

function Loading() {
  return (
    <motion.div
      className="loader-screen"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <div className="spinner"></div>
      <p>Initializing Culinary Matrix...</p>
    </motion.div>
  );
}

export default Loading;