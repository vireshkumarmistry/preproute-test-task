import React, { useState, useEffect } from "react";
import apiClient from "../services/apiClient";
import { AuthContext, type User } from "../utils/helper";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("preproot_user");
    const token = localStorage.getItem("token");
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("preproot_user");
        localStorage.removeItem("token");
      }
    } else {
      localStorage.removeItem("preproot_user");
      localStorage.removeItem("token");
    }
    setIsLoading(false);
  }, []);

  const login = async (userId: string, password?: string) => {
    const response = await apiClient.post("/auth/login", { userId, password });
    const { token, user: loggedInUser } = response.data.data;

    localStorage.setItem("token", token);
    localStorage.setItem("preproot_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("preproot_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
