import React from "react";

const ChefLeft = ({ name, image, bio, wiki }) => {
  return (
    <div className="chef-row">
      <img src={image} alt={name} className="chef-image" />
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
    </div>
  );
};

export default ChefLeft;
