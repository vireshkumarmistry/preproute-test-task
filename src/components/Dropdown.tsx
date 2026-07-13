import { useState } from "react";
import { ChevronDown } from "lucide-react";

interface DropdownProps {
  label?: string;
  options: { id: string; name: string }[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
  variant?: "default" | "borderless";
  showLabelInline?: boolean;
}

const Dropdown = ({
  label,
  options,
  selectedId,
  onChange,
  disabled,
  error,
  placeholder = "Select option",
  className = "",
  variant = "default",
  showLabelInline = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.id === selectedId);

  return (
    <div className={`relative ${className}`}>
      {label && !showLabelInline && (
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full text-xs text-slate-500 px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl flex items-center justify-between cursor-pointer select-none transition-all active:scale-98 min-h-[38px] sm:min-h-[42px] ${
          variant === "borderless"
            ? "bg-slate-50 hover:bg-slate-100/70 shadow-2xs"
            : `bg-white border ${
                error
                  ? "border-red-500 bg-red-50/10"
                  : "border-[#d9e5f7] hover:border-slate-350"
              }`
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span className="flex items-center gap-1.5 truncate">
          {label && showLabelInline && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
              {label}
            </span>
          )}
          {selectedOption ? (
            <span className="text-slate-700 font-extrabold truncate">
              {selectedOption.name}
            </span>
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-20">
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative mt-2 max-h-60 overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-lg z-20 p-1.5 space-y-0.5 animate-in fade-in slide-in-from-top-2 duration-150">
            {options.length === 0 ? (
              <div className="text-slate-400 text-xs p-2.5 text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`px-3.5 py-2 hover:bg-slate-55 rounded-lg cursor-pointer transition-colors text-xs font-bold select-none ${
                    selectedId === opt.id
                      ? "bg-blue-50 text-[#1f59da]"
                      : "text-slate-650"
                  }`}
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>
      )}
    </div>
  );
};

export default Dropdown;
