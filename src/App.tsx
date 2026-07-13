import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./utils/helper";
import LoginPage from "./features/auth/LoginPage";

// Lazy-loaded pages
const TestListPage = lazy(() => import("./pages/TestListPage"));
const TestCreationPage = lazy(() => import("./pages/TestCreationPage"));
const TestEditMetadataPage = lazy(() => import("./pages/TestEditMetadataPage"));
const TestEditorPage = lazy(() => import("./pages/TestEditorPage"));
const TestTrackingPage = lazy(() => import("./pages/TestTrackingPage"));

// Lazy-loaded features that could eventually move to pages
const TestPublish = lazy(() => import("./features/tests/TestPublish"));
const TestView = lazy(() => import("./features/tests/TestView"));

const LoadingFallback = () => (
  <div className="flex min-h-screen items-center justify-center bg-[#f8fafc]">
    <div className="flex flex-col items-center gap-3">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#1f59da] border-t-transparent" />
      <p className="text-sm font-semibold text-gray-500">
        Loading PrepRoute...
      </p>
    </div>
  </div>
);

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!user) {
    return <LoginPage />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<TestListPage />} />
        <Route path="/tests/create" element={<TestCreationPage />} />
        <Route path="/tests/edit/:id" element={<TestEditMetadataPage />} />
        <Route path="/tests/editor/:id" element={<TestEditorPage />} />
        <Route path="/tests/publish/:id" element={<TestPublish />} />
        <Route path="/tests/view/:id" element={<TestView />} />
        <Route path="/tests/tracking" element={<TestTrackingPage />} />
      </Routes>
    </Suspense>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
