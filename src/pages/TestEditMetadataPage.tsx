import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import TestCreationForm from "../features/tests/TestSetupForm";

const TestEditMetadataPage = () => {
  const { id } = useParams<{ id: string }>();
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
        "Edit Test",
        formatBreadcrumbTab(activeTab),
      ]}
    >
      <TestCreationForm
        testId={id}
        onCancel={() => navigate("/")}
        onTabChange={setActiveTab}
        onSubmit={(updatedTestData) => {
          navigate(`/tests/editor/${updatedTestData.id}`);
        }}
      />
    </MainLayout>
  );
};

export default TestEditMetadataPage;
