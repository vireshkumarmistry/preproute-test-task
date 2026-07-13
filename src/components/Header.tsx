import { useState } from "react";
import { Bell, ChevronDown, LogOut, Menu } from "lucide-react";
import { useAuth } from "../utils/helper";
import avatarSvg from "../assets/avatar.svg";
import logoSvg from "../assets/logo.svg";

interface HeaderProps {
  onMenuClick: () => void;
  action?: React.ReactNode;
}

const Header = ({ onMenuClick, action }: HeaderProps) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-[60px] w-full items-center justify-between bg-white px-6 shrink-0 border-b border-[#f4f6fc]">
      {/* Left: Logo + Hamburger */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center w-[180px] shrink-0">
          <img src={logoSvg} alt="PrepRoute" className="h-[28px] w-auto" />
        </div>

        <button
          onClick={onMenuClick}
          className="rounded p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right: Notification bell + User profile */}
      <div className="flex items-center gap-3">
        {action}
        {/* Notification bell */}
        <button className="relative p-2 rounded-full border border-gray-200 text-[#9ca3af] hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
          <Bell className="h-5 w-5" strokeWidth={1.8} />
          {/* Green notification dot */}
          <span className="absolute top-[6px] right-[6px] h-[10px] w-[10px] rounded-full border-2 border-white bg-[#34d399]" />
        </button>

        {/* User profile */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 py-1 pl-1 pr-1 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer focus:outline-none"
          >
            {/* Avatar */}
            <div className="h-12 w-10 rounded-full overflow-hidden shrink-0">
              <img src={avatarSvg} alt="PrepRoute" />
            </div>

            {/* Name & Role */}
            <div className="hidden md:flex flex-col items-start">
              <span className="text-[13px] font-semibold text-[#1f2937] leading-tight capitalize">
                {user?.name?.toLowerCase() || "Alex Wando"}
              </span>
              <span className="text-[11px] text-[#9ca3af] leading-tight">
                {user?.role || "Admin"}
              </span>
            </div>

            <ChevronDown className="h-3.5 w-3.5 text-[#9ca3af] hidden md:block" />
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-44 rounded-lg border border-gray-100 bg-white py-1 shadow-lg z-50">
                {/* Mobile-only user info */}
                <div className="border-b border-gray-50 px-3.5 py-2 md:hidden">
                  <p className="text-sm font-semibold text-gray-900">
                    {user?.name || "Alex Wando"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.role || "Admin"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
