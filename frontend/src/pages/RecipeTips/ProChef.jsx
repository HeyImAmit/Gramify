import React from "react";
import "./ProChef.css";
import ChefLeft from "./ChefLeft";
import ChefRight from "./ChefRight";
import { assets } from "../../assets/assets";

const chefs = [
  {
    name: "Gordon Ramsay",
    image: assets.gr,
    bio: "World-renowned chef known for his Michelin-starred restaurants and fiery television presence. Famous for 'Hell's Kitchen' and 'MasterChef'.",
    wiki: "https://en.wikipedia.org/wiki/Gordon_Ramsay",
  },
  {
    name: "Sanjeev Kapoor",
    image: assets.sanjeev,
    bio: "Celebrity Indian chef and entrepreneur. Host of the famous TV show 'Khana Khazana' and author of numerous cookbooks.",
    wiki: "https://en.wikipedia.org/wiki/Sanjeev_Kapoor",
  },
  {
    name: "Massimo Bottura",
    image: assets.massimo,
    bio: "Italian chef-owner of Osteria Francescana, a three-Michelin-star restaurant consistently ranked among the best in the world.",
    wiki: "https://en.wikipedia.org/wiki/Massimo_Bottura",
  },
  {
    name: "Christina Tosi",
    image: assets.tosi,
    bio: "Founder of Milk Bar, known for innovative baking techniques. A creative force behind dessert innovation.",
    wiki: "https://en.wikipedia.org/wiki/Christina_Tosi",
  },
  {
    name: "Vikas Khanna",
    image: assets.vikas,    
    bio: "Michelin-starred Indian chef, restaurateur, and humanitarian. Hosted 'MasterChef India' and worked with the UN on hunger initiatives.",
    wiki: "https://en.wikipedia.org/wiki/Vikas_Khanna",
  },
];

const ProChef = () => {
  return (
    <section className="chefs-section">
      <h2 className="chefs-title">Meet the Pro Chefs</h2>
      <p className="chefs-subtitle">
        Explore the stories and styles of some of the greatest culinary legends.
      </p>

      <div className="chefs-list">
        {chefs.map((chef, idx) =>
          idx % 2 === 0 ? (
            <ChefLeft key={chef.name} {...chef} />
          ) : (
            <ChefRight key={chef.name} {...chef} />
          )
        )}
      </div>
    </section>
  );
};

export default ProChef;
