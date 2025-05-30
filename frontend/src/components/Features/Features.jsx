import React from 'react';
import './Features.css';
import { assets } from "../../assets/assets";

const features = [
  {
    title: "Real-Time Conversion",
    description: "Convert values instantly with high precision and seamless responsiveness.",
    image: assets.phoneImg,
  },
  {
    title: "Unit Smartness",
    description: "Automatically detects and adapts to units for ease of use and accuracy.",
    image: assets.weighScale,
  },
  {
    title: "Minimal UI",
    description: "Experience a clean and distraction-free interface optimized for efficiency.",
    image: assets.minUI,
  },
];

const Features = () => {
  return (
    <section className="features-section">
      <h2 className="features-title">Features</h2>
      <div className="features-grid">
        {features.map((feature, idx) => (
          <div className="feature-card pictured" key={idx}>
            <img src={feature.image} alt={feature.title} className="feature-image" />
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
