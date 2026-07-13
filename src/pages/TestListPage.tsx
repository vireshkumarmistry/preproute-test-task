
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "../components/MainLayout";
import TestList from "../features/tests/TestDashboard";
import type { Test } from "../types/tests";
import { useTests, useDeleteTest } from "../hooks/apiHooks";
import type { ApiTest } from "../hooks/apiHooks";
import { TestListSkeleton } from "../components/skeletons/TestListSkeleton";

const TestListPage = () => {
  const queryClient = useQueryClient();
  const { data: apiTests, isLoading: isTestsLoading } = useTests();
  const navigate = useNavigate();
  const deleteTestMutation = useDeleteTest();

  const handleDeleteTest = (id: string) => {
    deleteTestMutation.mutate(id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tests"] });
      },
    });
  };

  if (isTestsLoading) {
    return (
      <MainLayout>
        <TestListSkeleton />
      </MainLayout>
    );
  }

  // Map API tests to UI test format
  const tests: Test[] = (apiTests || []).map((t: ApiTest) => {
    let statusVal: "Active" | "Draft" | "Completed" | "Live" | "Unpublished" = "Active";
    if (t.status) {
      const s = t.status.toLowerCase();
      if (s === "active" || s === "live") {
        statusVal = "Active";
      } else if (s === "draft") {
        statusVal = "Draft";
      } else if (s === "completed") {
        statusVal = "Completed";
      } else if (s === "unpublished") {
        statusVal = "Unpublished";
      } else {
        statusVal = (t.status.charAt(0).toUpperCase() + t.status.slice(1)) as any;
      }
    }
    return {
      id: t.id,
      name: t.name,
      subject: t.subject,
      topics: t.topics,
      status: statusVal,
      createdDate: t.created_at
        ? t.created_at.split("T")[0]
        : new Date().toISOString().split("T")[0],
      questionsCount: t.total_questions || 25,
      duration: t.total_time || 60,
      type: t.type,
      difficulty: t.difficulty,
    };
  });

  return (
    <MainLayout>
      <TestList
        tests={tests}
        onDelete={handleDeleteTest}
        onEditStart={(id) => navigate(`/tests/edit/${id}`)}
        onCreateNew={() => navigate("/tests/create")}
      />
    </MainLayout>
  );
};

export default TestListPage;
