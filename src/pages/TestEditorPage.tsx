import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../components/MainLayout";
import TestEditor from "../features/tests/TestEditor";
import type { QuestionItem } from "../types/tests";
import { useGetTest, useFetchBulkQuestions } from "../hooks/apiHooks";
import type { ApiQuestion } from "../hooks/apiHooks";
import { TestEditorSkeleton } from "../components/skeletons/TestEditorSkeleton";

const TestEditorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  useEffect(() => {
    setInitialLoadDone(false);
  }, [id]);

  const { data: testData } = useGetTest(id || "");

  // Determine if the questions list consists of IDs (strings)
  const rawQuestions = (testData?.questions as (string | ApiQuestion)[]) || [];
  const questionIds = rawQuestions.filter(
    (q): q is string => typeof q === "string",
  );

  // Fetch full details if we only have IDs
  const { data: bulkQuestions } = useFetchBulkQuestions(questionIds);

  useEffect(() => {
    if (testData && (questionIds.length === 0 || bulkQuestions)) {
      setInitialLoadDone(true);
    }
  }, [testData, questionIds.length, bulkQuestions]);

  const showSkeleton = !initialLoadDone;

  if (showSkeleton) {
    return (
      <MainLayout>
        <TestEditorSkeleton />
      </MainLayout>
    );
  }

  if (!testData) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-[#f8fafc] p-4 text-center">
          <div className="max-w-md bg-white p-6 rounded-2xl border border-red-100 shadow-sm">
            <p className="text-red-500 font-semibold mb-4">Test not found</p>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[#1f59da] text-white text-sm font-semibold rounded-lg cursor-pointer hover:bg-[#1a4bbb]"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const testDetails = {
    id: testData.id,
    name: testData.name,
    subject: testData.subject,
    topic: testData.topics ? testData.topics.join(", ") : "",
    subTopic: testData.sub_topics ? testData.sub_topics.join(", ") : "",
    duration: testData.total_time || 60,
    questionsCount: testData.total_questions || 25,
    correctMarks: testData.correct_marks || 5,
    type: testData.type,
    difficulty: testData.difficulty,
  };

  const apiQuestions =
    questionIds.length > 0
      ? bulkQuestions || []
      : (rawQuestions as ApiQuestion[]);
  const mappedQuestions: QuestionItem[] = apiQuestions.map((q, i) => {
    return {
      id: i + 1,
      text: q.question || "",
      options: [
        q.option1 || "",
        q.option2 || "",
        q.option3 || "",
        q.option4 || "",
      ],
      correctOptionIdx: q.correct_option
        ? parseInt(q.correct_option.replace("option", "")) - 1
        : null,
      solution: q.explanation || "",
      difficulty: q.difficulty
        ? q.difficulty.charAt(0).toUpperCase() + q.difficulty.slice(1)
        : "Easy",
      topic: q.topic || "",
      subtopic: q.subtopic || "",
      isCompleted: !!q.question,
      media_url: q.media_url || "",
    };
  });

  const totalQuestionsLimit = testData.total_questions || 1;
  while (mappedQuestions.length < totalQuestionsLimit) {
    const nextIdx = mappedQuestions.length + 1;
    mappedQuestions.push({
      id: nextIdx,
      text: "",
      options: ["", "", "", ""],
      correctOptionIdx: null,
      solution: "",
      difficulty: "Easy",
      topic: testData.topics && testData.topics[0] ? testData.topics[0] : "",
      subtopic: "",
      isCompleted: false,
      media_url: "",
    });
  }

  return (
    <TestEditor
      testDetails={testDetails}
      onExit={() => navigate("/")}
      initialQuestions={mappedQuestions}
    />
  );
};

export default TestEditorPage;
