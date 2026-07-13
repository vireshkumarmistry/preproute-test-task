import { useNavigate, useLocation } from "react-router-dom";
import { TrendingUp, FileEdit, ClipboardList, X } from "lucide-react";
import logoSvg from "../assets/logo.svg";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
  hideLogo?: boolean;
}

const Sidebar = ({
  isOpen,
  onClose,
  isCollapsed = false,
  hideLogo = false,
}: SidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveView = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path === "/tests/create") return "test-creation";
    if (path.startsWith("/tests/edit/")) return "test-creation";
    if (path.startsWith("/tests/editor/")) return "test-editor";
    if (path.startsWith("/tests/publish/")) return "test-creation";
    if (path === "/tests/tracking") return "test-tracking";
    return "dashboard";
  };
  const currentView = getActiveView();

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: TrendingUp },
    { id: "test-creation", name: "Test Creation", icon: FileEdit },
    { id: "test-tracking", name: "Test Tracking", icon: ClipboardList },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-white border-r border-gray-100 transition-all duration-300 lg:static lg:translate-x-0 ${
          isCollapsed ? "w-[70px]" : "w-60"
        } ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        {!hideLogo && (
          <div
            className={`flex h-[60px] items-center px-4 shrink-0 border-b border-[#f4f6fc] ${isCollapsed ? "justify-center px-2" : ""}`}
          >
            {!isCollapsed ? (
              <img
                src={logoSvg}
                alt="PrepRoute"
                className="w-[120px] h-[30px]"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-[#f3f6ff] flex items-center justify-center border border-[#eef2ff] overflow-hidden">
                <img
                  src={logoSvg}
                  alt="P"
                  className="w-6 h-6 object-cover object-left"
                />
              </div>
            )}
            {/* Mobile close */}
            {!isCollapsed && (
              <button
                onClick={onClose}
                className="ml-auto p-1 text-gray-400 hover:text-gray-600 lg:hidden cursor-pointer"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1 px-3 pt-6">
          {menuItems.map((item) => {
            const isActive = currentView === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  if (item.id === "dashboard") {
                    navigate("/");
                  } else if (item.id === "test-creation") {
                    navigate("/tests/create");
                  } else if (item.id === "test-tracking") {
                    navigate("/tests/tracking");
                  }
                  onClose();
                }}
                className={`relative flex items-center rounded-lg py-2.5 transition-all duration-150 cursor-pointer overflow-hidden ${
                  isCollapsed
                    ? "justify-center w-full px-0"
                    : "w-full pl-4 pr-3 gap-2.5 text-[14px]"
                } ${
                  isActive
                    ? "bg-[#f3f6ff] text-[#2563eb]"
                    : "text-[#6b7280] hover:bg-gray-50 hover:text-gray-700"
                }`}
                title={isCollapsed ? item.name : undefined}
              >
                {/* Active left bar indicator */}
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-[5px] bg-[#2563eb]" />
                )}

                <Icon
                  className={`h-[18px] w-[18px] shrink-0 ${
                    isActive ? "text-[#2563eb]" : "text-[#9ca3af]"
                  }`}
                  strokeWidth={isActive ? 2.2 : 1.8}
                />
                {!isCollapsed && (
                  <span className="font-medium">{item.name}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
