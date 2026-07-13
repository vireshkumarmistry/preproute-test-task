import React from "react";

interface PillProps {
  text: string;
  variant?: "yellow" | "blue" | "gray" | "emerald";
}

export const Pill: React.FC<PillProps> = ({ text, variant = "yellow" }) => {
  const styles = {
    yellow: "bg-white text-[#fbbf24] border border-[#facc15]",
    blue: "bg-white text-[#1f59da] border border-[#d9e5f7]",
    gray: "bg-gray-50 text-gray-500 border border-gray-200",
    emerald: "bg-emerald-50 text-emerald-700 border border-emerald-250",
  };

  return (
    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize inline-block ${styles[variant]}`}>
      {text}
    </span>
  );
};
