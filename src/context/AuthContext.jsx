/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext(null);

function readSavedSession() {
  const token = localStorage.getItem("token");
  const serializedUser = localStorage.getItem("user");

  if (!token || !serializedUser) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }

  try {
    const user = JSON.parse(serializedUser);
    if (!user || typeof user !== "object" || typeof user.role !== "string") {
      throw new Error("Saved account data is invalid.");
    }

    return { token, user };
  } catch {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return { token: null, user: null };
  }
}

function normalizeUser(user) {
  return {
    ...user,
    id: user.id || user._id,
  };
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSavedSession);
  const [isRestoring, setIsRestoring] = useState(Boolean(session.token));
  const [restoreError, setRestoreError] = useState("");
  const { token, user } = session;

  const request = async (path, options = {}) => {
    try {
      const response = await api.request({
        url: `/auth${path}`,
        headers: { "Content-Type": "application/json" },
        ...options,
      });
      return response.data;
    } catch (requestError) {
      const error = new Error(
        requestError.response?.data?.message ||
          requestError.message ||
          "Authentication request failed",
      );
      error.status = requestError.response?.status;
      throw error;
    }
  };

  const saveSession = (data) => {
    if (
      typeof data?.token !== "string" ||
      !data.token ||
      !data.user ||
      typeof data.user.role !== "string"
    ) {
      throw new Error("The authentication response did not contain a valid session.");
    }

    const nextSession = { token: data.token, user: normalizeUser(data.user) };
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(nextSession.user));
    setSession(nextSession);
    setRestoreError("");
    setIsRestoring(false);
    return { ...data, user: nextSession.user };
  };

  useEffect(() => {
    if (!token || !isRestoring) return undefined;

    let active = true;

    api.get("/auth/me")
      .then(({ data }) => {
        if (!active) return;
        if (!data?.user || typeof data.user.role !== "string") {
          throw new Error("The server returned an invalid account session.");
        }

        const verifiedUser = normalizeUser(data.user);
        localStorage.setItem("user", JSON.stringify(verifiedUser));
        setSession((current) => ({ ...current, user: verifiedUser }));
        setRestoreError("");
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.response?.status !== 401) {
          setRestoreError("We couldn't verify your saved session. Check your connection and try again.");
          return;
        }
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setSession({ token: null, user: null });
      })
      .finally(() => {
        if (active) setIsRestoring(false);
      });

    return () => {
      active = false;
    };
  }, [isRestoring, token]);

  const login = async (identifier, password) => {
    return saveSession(await request("/login", {
      method: "POST",
      data: { identifier, password },
    }));
  };

  const register = async (username, name, email, phone, password) => {
    return request("/register", {
      method: "POST",
      data: { username, name, email, phone, password },
    });
  };

  const googleLogin = async (credential) => {
    return saveSession(await request("/google", {
      method: "POST",
      data: { credential },
    }));
  };

  const forgotPassword = async (email) => {
    return request("/forgot-password", {
      method: "POST",
      data: { email },
    });
  };

  const resetPassword = async (tokenValue, password) => {
    return request("/reset-password", {
      method: "POST",
      data: { token: tokenValue, password },
    });
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSession({ token: null, user: null });
    setRestoreError("");
    setIsRestoring(false);
  };

  const retrySessionRestore = () => {
    if (!token) return;
    setRestoreError("");
    setIsRestoring(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isRestoring,
        restoreError,
        retrySessionRestore,
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
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}