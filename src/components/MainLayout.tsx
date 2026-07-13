import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";

interface MainLayoutProps {
  children: React.ReactNode;
  headerAction?: React.ReactNode;
  customBreadcrumbs?: string[];
}

const MainLayout = ({
  children,
  headerAction,
  customBreadcrumbs,
}: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  useEffect(() => {
    const handleShowNotification = (e: Event) => {
      const customEvent = e as CustomEvent<{
        message: string;
        type: "success" | "error" | "info";
      }>;
      setNotification(customEvent.detail);
    };

    window.addEventListener("show-notification", handleShowNotification);
    return () => {
      window.removeEventListener("show-notification", handleShowNotification);
    };
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const location = useLocation();
  const navigate = useNavigate();

  // Generate view name based on pathname
  const getActiveView = () => {
    const path = location.pathname;
    if (path === "/" || path === "/dashboard") return "dashboard";
    if (path === "/tests/create") return "test-creation";
    if (path.startsWith("/tests/edit/")) return "test-edit-metadata";
    if (path.startsWith("/tests/editor/")) return "test-editor";
    if (path.startsWith("/tests/publish/")) return "test-publish";
    if (path === "/tests/tracking") return "test-tracking";
    return "dashboard";
  };
  const currentView = getActiveView();

  // Generate breadcrumbs based on the selected view
  const getBreadcrumbs = () => {
    if (customBreadcrumbs) return customBreadcrumbs;
    switch (currentView) {
      case "dashboard":
        return ["Test", "View Tests"];
      case "test-creation":
        return ["Test", "Create Test", "Chapter Wise"];
      case "test-publish":
        return ["Test", "Preview & Publish"];
      case "test-tracking":
        return ["Test Tracking"];
      default:
        return [""];
    }
  };

  const getBreadcrumbLink = (crumb: string) => {
    switch (crumb) {
      case "Test":
      case "View Tests":
        return "/";
      case "Create Test":
        return "/tests/create";
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      {/* Sleek Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg animate-in slide-in-from-top-2 fade-in duration-200 ${notification.type === "error"
            ? "bg-red-50 border-red-200 text-red-800"
            : notification.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-[#065f46]"
              : "bg-blue-50 border-blue-200 text-blue-800"
            }`}
        >
          <span className="text-xs font-semibold">{notification.message}</span>
          <button
            onClick={() => setNotification(null)}
            className="text-gray-400 hover:text-gray-600 transition-colors p-0.5 cursor-pointer bg-transparent border-none text-xs font-bold leading-none"
          >
            ✕
          </button>
        </div>
      )}
      {/* Header spanning full width */}
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isCollapsed={
            currentView === "test-editor" || currentView === "test-publish"
          }
          hideLogo={true} // Logo is now permanently in the header
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Breadcrumbs Sub-header inside Content Part */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b border-[#f4f6fc] bg-white shrink-0 select-none ${currentView === "test-editor" ? "lg:pl-[244px]" : ""
              }`}
          >
            <nav aria-label="Breadcrumb">
              <ol className="flex items-center text-[13px]">
                {getBreadcrumbs().map((crumb, idx) => {
                  const isLast = idx === getBreadcrumbs().length - 1;
                  const link = getBreadcrumbLink(crumb);
                  return (
                    <li key={idx} className="flex items-center">
                      {idx > 0 && (
                        <span className="mx-2 text-gray-300 font-normal">
                          /
                        </span>
                      )}
                      {link && !isLast ? (
                        <button
                          onClick={() => navigate(link)}
                          className="text-[#6b7280] font-medium hover:text-[#1f2937] transition-colors cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                        >
                          {crumb}
                        </button>
                      ) : (
                        <span
                          className={
                            isLast
                              ? "text-[#1f2937] font-semibold"
                              : "text-[#6b7280] font-medium"
                          }
                        >
                          {crumb}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
            {headerAction && (
              <div className="flex items-center">{headerAction}</div>
            )}
          </div>

          {/* Scrollable Page Body */}
          <main className="flex-1 overflow-y-auto p-5 bg-white">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
