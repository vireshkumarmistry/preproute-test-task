import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import TestCreationForm from "../features/tests/TestSetupForm";

const TestCreationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<
    "Chapterwise" | "PYQ" | "Mock Test"
  >("Chapterwise");

  const formatBreadcrumbTab = (tab: string) => {
    if (tab === "Chapterwise") return "Chapter Wise";
    if (tab === "PYQ") return "PYQ";
    if (tab === "Mock Test") return "Mock Test";
    return tab;
  };

  return (
    <MainLayout
      customBreadcrumbs={[
        "Test Creation",
        "Create Test",
        formatBreadcrumbTab(activeTab),
      ]}
    >
      <TestCreationForm
        onCancel={() => navigate("/")}
        onTabChange={setActiveTab}
        onSubmit={(newTestData) => {
          // Navigate to the editor for this newly created test
          navigate(`/tests/editor/${newTestData.id}`);
        }}
      />
    </MainLayout>
  );
};

export default TestCreationPage;
