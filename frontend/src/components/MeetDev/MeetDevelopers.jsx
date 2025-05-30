import React from "react";
import "./MeetDevelopers.css";
import { assets } from "../../assets/assets";

const developers = [
  {
    name: "Aditya Goswami",
    role: "ML Model Developer",
    bio: "Transforms data into smart features by building and fine-tuning ML models that enhance decision-making and user engagement",
    image: assets.adi,
    linkedin: "https://www.linkedin.com/in/adityaxgoswami/", 
  },
  {
    name: "Amit Prasad Lal",
    role: "Full Stack Developer",
    bio: "Builds scalable APIs and handles server-side architecture with Node.js along with intuitive UIs with React and ensures seamless user experiences.",
    image: assets.me,
    linkedin: "https://www.linkedin.com/in/amitprasadlal/", 
  },
  {
    name: "Subham Mohanty",
    role: "AI Integration Lead",
    bio: "Connects the magic of AI with real-world use—blending innovation and intelligence into every user interaction.",
    image: assets.shubham,
    linkedin: "https://www.linkedin.com/in/subham-mohanty-3a1805316/", 
  },
  {
    name: "Sreetam Mohanty",
    role: "Backend ML Integration Lead",
    bio: "Bridges complex ML models and backend systems, ensuring smooth deployment.",
    image: assets.shreetam,
    linkedin: "https://www.linkedin.com/in/mohantysreetam/", 
  },
];

const MeetDevelopers = () => {
  return (
    <section className="developers-section">
      <h2 className="developers-title">Meet the Developers</h2>
      <div className="developers-container">
        {developers.map((dev, index) => (
          <div className="developer-card" key={index}>
            <div className="dev-img-container">
              <img src={dev.image} alt={dev.name} className="dev-img" />
            </div>
            <a
              href={dev.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="dev-name-link"
            >
              <h3>{dev.name}</h3>
            </a>
            <h4>{dev.role}</h4>
            <p>{dev.bio}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MeetDevelopers;
