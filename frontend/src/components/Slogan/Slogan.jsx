import React from 'react';
import './Slogan.css';

const Slogan = () => {
  return (
    <section className="slogan-section">
      <div className="slogan-container">
        <h2 className="slogan-title">Measure Smarter. Live Better.</h2>
        <p className="slogan-subtitle">
          Gramify empowers your kitchen journey with accurate, instant, and intuitive conversions—because precision makes every recipe better.
        </p>
        <div className="slogan-highlights">
          <div className="slogan-highlight">⚡ Instant Conversion</div>
          <div className="slogan-highlight">🎯 Highly Accurate</div>
          <div className="slogan-highlight">📱 User Friendly</div>
          <div className="slogan-highlight">🧠 Easy to Use</div>
        </div>
      </div>
    </section>
  );
};

export default Slogan;
