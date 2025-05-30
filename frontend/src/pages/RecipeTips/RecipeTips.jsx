import React, { useState, useEffect, useRef } from "react";
import "./RecipeTips.css";
import { CheckCircle } from "lucide-react";

const tips = [
  "Always use level measuring cups and spoons for dry ingredients.",
  "Preheat pans and ovens to ensure even cooking and better browning.",
  "Let pancake or cake batter rest for 5–10 mins to improve texture.",
  "Use a food scale for accuracy—Gramify helps convert all values precisely.",
  "Dry meat or veggies before searing to avoid steaming.",
  "Cut ingredients evenly to ensure they cook at the same rate.",
  "Use kosher salt for seasoning—it’s easier to control than table salt.",
  "Taste as you cook and adjust seasoning gradually.",
  "Use fresh herbs at the end of cooking to preserve their flavor.",
  "Always rest meats for 5–10 minutes after cooking for juicier results.",
  "When baking, use room-temperature butter, eggs, and milk unless told otherwise.",
  "Deglaze pans with wine, broth, or vinegar to create instant sauces.",
  "Keep a sharp knife—it’s safer and faster than a dull one.",
  "Don’t overcrowd the pan; it lowers heat and prevents browning.",
  "Use a thermometer—chicken should be 165°F (74°C), beef medium = 145°F (63°C).",
  "Store spices in airtight containers away from light to retain flavor longer.",
  "Let dough rise in a warm, draft-free environment for better texture.",
  "Use the right oil smoke point for your cooking method.",
  "Rest pasta after draining for a minute to prevent sticking.",
  "Use acidic ingredients (like lemon or vinegar) to brighten flavors.",
  "Chill cookie dough before baking to improve shape and texture.",
];

const TIPS_PER_PAGE = 3;
const ROTATION_COUNT = 7;
const INTERVAL_MS = 7000;

const RecipeTips = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDot, setActiveDot] = useState(0);
  const intervalRef = useRef(null);
  const progressRefs = useRef([]);

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setActiveDot((prev) => (prev + 1) % ROTATION_COUNT);
    }, INTERVAL_MS);
  };

  useEffect(() => {
    startInterval();
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    setCurrentIndex(activeDot * TIPS_PER_PAGE);

    progressRefs.current.forEach((dot, idx) => {
      if (!dot) return;
      dot.classList.remove("active");
      if (idx === activeDot) {
        void dot.offsetWidth; // trigger reflow to restart animation
        dot.classList.add("active");
      }
    });
  }, [activeDot]);

  const handleDotClick = (index) => {
    setActiveDot(index);
    startInterval();
  };

  const displayedTips = tips.slice(currentIndex, currentIndex + TIPS_PER_PAGE);

  return (
    <section className="tips-section-carousel">
      <h2 className="tips-title">Pro Tips for Perfect Cooking</h2>
      <p className="tips-subtitle">
        Upgrade your kitchen game with practical, science-backed advice powered by Gramify precision.
      </p>

      <div className="tips-list-carousel">
        {displayedTips.map((tip, idx) => (
          <div className="tip-item-carousel" key={currentIndex + idx}>
            <CheckCircle className="tip-icon" />
            <p>{tip}</p>
          </div>
        ))}
      </div>

      <div className="dots-container">
        {[...Array(ROTATION_COUNT)].map((_, idx) => (
          <div
            key={idx}
            className={`dot ${activeDot === idx ? "active" : ""}`}
            onClick={() => handleDotClick(idx)}
            ref={(el) => (progressRefs.current[idx] = el)}
          />
        ))}
      </div>
    </section>
  );
};

export default RecipeTips;
