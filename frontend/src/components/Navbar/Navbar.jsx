import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useStore } from "../../context/StoreContext";
import "./Navbar.css";
import { assets } from "../../assets/assets";

const Navbar = () => {
  const { user, logout } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="logo">
        <Link to="/">
          <h2 className="logo-text">
            {"Gramify".split("").map((char, i) => (
              <span key={i}>{char}</span>
            ))}
          </h2>
        </Link>
      </div>

      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        <li className={currentPath === "/" ? "active" : ""}>
          <Link to="/" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
        </li>
        <li className={currentPath === "/convert-units" ? "active" : ""}>
          <Link to="/convert-units" onClick={() => setMenuOpen(false)}>
            Convert Units
          </Link>
        </li>
        <li className={currentPath === "/recipe-tips" ? "active" : ""}>
          <Link to="/recipe-tips" onClick={() => setMenuOpen(false)}>
            Recipe Tips
          </Link>
        </li>
        <li className={currentPath === "/forum" ? "active" : ""}>
          <Link to="/forum" onClick={() => setMenuOpen(false)}>
            Forum
          </Link>
        </li>
      </div>

      <div className="auth-buttons" ref={dropdownRef}>
        {user ? (
          <>
            <button
              className="user-avatar-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-label="User menu"
              title={user.name || "User"}
            >
              <img
                src={user.avatarUrl || assets.user}
                alt="User"
                className="user-avatar"
              />
            </button>

            {dropdownOpen && (
              <div className="user-dropdown glass-popup">
                <p className="user-name">👋 Hello, &nbsp;{user.name}</p>
                <button className="logout-button" onClick={handleLogout}>
                  Log out
                </button>
              </div>
            )}
          </>
        ) : (
          <button className="signup" onClick={() => navigate("/login", { state: { from: location } })}>
            Login
          </button>
        )}
      </div>

      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span />
        <span />
        <span />
      </div>
    </nav>
  );
};

export default Navbar;
