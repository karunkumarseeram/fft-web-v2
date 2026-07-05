import { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode"; // Important for decoding role from JWT

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Retrieving stored token for initial load
  const storedToken = localStorage.getItem("token");
  const [token, setToken] = useState(storedToken);
  const [userRole, setUserRole] = useState(null);

  // Decode token and set user role on load
  useEffect(() => {
    if (storedToken) {
      try {
        const decoded = jwtDecode(storedToken); // Extract role
        setUserRole(decoded.role);
      } catch (err) {
        console.error("Invalid token on load:", err);
        logout(); // Clear invalid token
      }
    }
  }, [storedToken]);

  const login = (newToken) => {
    localStorage.setItem("token", newToken); // Save token
    setToken(newToken);
    try {
      const decoded = jwtDecode(newToken); // Decode role from token
      setUserRole(decoded.role);
    } catch (err) {
      console.error("Failed to decode token:", err);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token"); // Remove token from storage
    setToken(null);
    setUserRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, userRole, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};