import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { loginRequest } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // 🔹 Cargar sesión desde token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
      } catch (err) {
        localStorage.removeItem("token");
      }
    }
  }, []);

  const loginUser = async (credentials) => {
    const response = await loginRequest(credentials);

    const { access_token } = response.data;

    // Guardar token
    localStorage.setItem("token", access_token);

    // Decodificar token
    const decodedUser = jwtDecode(access_token);

    setUser(decodedUser);

    return decodedUser;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
