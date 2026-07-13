import { createContext, useContext } from "react";

export interface User {
  name: string;
  role: string;
  userId: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (userId: string, password?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const showNotification = (
  message: string,
  type: "success" | "error" | "info" = "info",
) => {
  window.dispatchEvent(
    new CustomEvent("show-notification", { detail: { message, type } }),
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const isUuid = (val: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);

export const getDifficultyColor = (difficulty?: string) => {
  const diff = difficulty?.toLowerCase();
  if (diff === "medium") return "bg-amber-500 text-white";
  if (diff === "difficult" || diff === "hard")
    return "bg-rose-500 text-white";
  return "bg-[#2dd4bf] text-white"; // default/easy
};

export const formatType = (type?: string) => {
  if (!type) return "Chapter Wise";
  if (type === "chapterwise") return "Chapter Wise";
  if (type === "subjectwise") return "Subject Wise";
  if (type === "full") return "Full Test";
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const getStatusStyle = (status: string | null) => {
  const s = status?.toLowerCase();
  if (s === "active" || s === "live")
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  if (s === "completed") return "bg-blue-50 text-blue-700 border-blue-100";
  return "bg-amber-50 text-amber-700 border-amber-100"; // draft
};

