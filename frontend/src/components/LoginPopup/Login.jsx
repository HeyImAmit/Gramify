import React, { useState, useEffect } from "react";
import { useStore } from "../../context/StoreContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./Login.css";

const LoginSignup = () => {
  const { user, login, signup } = useStore();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = location.state?.from?.pathname || "/";

  const resetFields = () => {
    setName("");
    setEmail("");
    setPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isSignup) {
        await signup(name, email, password);
      } else {
        await login(email, password);
      }
      resetFields();
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (user) {
      navigate(fromPath, { replace: true });
    }
  }, [user, navigate, fromPath]);

  return (
    <div className="container">
      <h1 className="title">{isSignup ? "Sign Up" : "Login"} to Gramify</h1>
      <form onSubmit={handleSubmit} className="form" autoComplete="off">
        {isSignup && (
          <input
            type="text"
            placeholder="Full Name"
            className="input"
            value={name}
            name="name"
            autoComplete="off"
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email"
          className="input"
          value={email}
          name="email"
          autoComplete="off"
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="input"
          value={password}
          name="password"
          autoComplete="new-password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" className="button">
          {isSignup ? "Sign Up" : "Login"}
        </button>
        {error && <p className="error-message">{error}</p>}
        <p
          className="switchText"
          onClick={() => {
            setIsSignup(!isSignup);
            resetFields();
            setError("");
          }}
          style={{ cursor: "pointer" }}
        >
          {isSignup ? "Already a user? Login" : "New here? Sign up"}
        </p>
      </form>
    </div>
  );
};

export default LoginSignup;
