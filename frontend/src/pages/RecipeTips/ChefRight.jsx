import React from "react";

const ChefRight = ({ name, image, bio, wiki }) => {
  return (
    <div className="chef-row reverse">
      <div className="chef-info">
        <h3>
          <a
            href={wiki}
            target="_blank"
            rel="noopener noreferrer"
            className="chef-link"
          >
            {name}
          </a>
        </h3>
        <p>{bio}</p>
      </div>
      <img src={image} alt={name} className="chef-image" />
    </div>
  );
};

export default ChefRight;
