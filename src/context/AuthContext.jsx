import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem("token");
  });

  const request = async (path, options = {}) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${API_URL}/api/auth${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || "Authentication request failed");
      error.status = response.status;
      throw error;
    }

    return data;
  };

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const login = async (identifier, password) => {
    return saveSession(
      await request("/login", {
        method: "POST",
        body: JSON.stringify({
          identifier,
          password,
        }),
      })
    );
  };

  const register = async (username, name, email, phone, password) => {
    return request("/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        name,
        email,
        phone,
        password,
      }),
    });
  };

  const googleLogin = async (credential) => {
    return saveSession(
      await request("/google", {
        method: "POST",
        body: JSON.stringify({ credential }),
      })
    );
  };

  const forgotPassword = async (email) => {
    return request("/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const resetPassword = async (tokenValue, password) => {
    return request("/reset-password", {
      method: "POST",
      body: JSON.stringify({ token: tokenValue, password }),
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        googleLogin,
        forgotPassword,
        resetPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}