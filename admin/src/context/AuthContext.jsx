import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = typeof window !== "undefined" ? localStorage.getItem("vendorToken") : null;

  const setAuth = (newToken, newVendor) => {
    if (newToken) {
      localStorage.setItem("vendorToken", newToken);
      setVendor(newVendor || null);
    } else {
      localStorage.removeItem("vendorToken");
      setVendor(null);
    }
  };

  const loadVendor = async () => {
    const t = localStorage.getItem("vendorToken");
    if (!t) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.getVendorMe();
      if (data.vendor) setVendor(data.vendor);
    } catch {
      localStorage.removeItem("vendorToken");
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendor();
  }, []);

  const login = async (email, password) => {
    const data = await api.vendorLogin(email, password);
    setAuth(data.token, data.vendor);
    return data;
  };

  const register = async (body) => {
    const data = await api.vendorRegister(body);
    if (data.token) setAuth(data.token, data.vendor);
    return data;
  };

  const logout = () => {
    setAuth(null);
  };

  return (
    <AuthContext.Provider
      value={{
        vendor,
        token,
        loading,
        login,
        register,
        logout,
        setVendor,
        loadVendor,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
