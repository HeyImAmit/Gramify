// StoreContext.jsx
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

export const StoreContextProvider = ({ children }) => {
  const [url, setUrl] = useState(
    import.meta.env.VITE_API_URL || "http://localhost:5000"
  );
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    axios.defaults.baseURL = url;
  }, [url]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [user]);

  const login = async (email, password) => {
    try {
      const res = await axios.post(`/api/user/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        throw new Error(res.data.message || "Login failed");
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const signup = async (name, email, password) => {
    try {
      const res = await axios.post(`/api/user/signup`, {
        name,
        email,
        password,
      });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setUser(res.data.user);
      } else {
        throw new Error(res.data.message || "Signup failed");
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || error.message);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <StoreContext.Provider value={{ url, setUrl, user, login, signup, logout }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
export default StoreContextProvider;
