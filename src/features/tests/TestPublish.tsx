import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "../../components/MainLayout";
import { Pill } from "../../components/Pill";
import {
  showNotification,
  isUuid,
  getDifficultyColor,
  formatType,
} from "../../utils/helper";
import {
  useGetTest,
  useUpdateTest,
  useSubjects,
  useTopics,
  useMultiTopicsSubTopics,
} from "../../hooks/apiHooks";
import {
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  HelpCircle,
  Check,
  Calendar,
  ChevronDown,
  Edit3,
} from "lucide-react";

const TestPublish = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: testData, isLoading } = useGetTest(id || "");
  const updateTestMutation = useUpdateTest();

  // Dynamic Metadata Fetching for Subject & Topics display mappings
  const { data: subjects = [] } = useSubjects();

  const subjectId = testData?.subject
    ? subjects.find(
        (s) => s.id === testData.subject || s.name === testData.subject,
      )?.id || (isUuid(testData.subject) ? testData.subject : "")
    : "";

  const { data: topics = [] } = useTopics(subjectId);

  const testTopicIds = testData?.topics || [];

  // Resolve topic names to UUIDs for sub-topics fetching
  const resolvedTopicIds = testTopicIds
    .map(
      (tid) =>
        topics.find((t) => t.id === tid || t.name === tid)?.id ||
        (isUuid(tid) ? tid : ""),
    )
    .filter(Boolean);

  const { data: subTopicsList = [] } =
    useMultiTopicsSubTopics(resolvedTopicIds);

  // UI States
  const [activePublishTab, setActivePublishTab] = useState<"Now" | "Schedule">(
    "Now",
  );
  const [liveDurationOption, setLiveDurationOption] =
    useState<string>("Always Available");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  if (isLoading) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto space-y-6 p-4 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 rounded-xl"></div>
            <div className="space-y-2">
              <div className="h-6 w-48 bg-gray-200 rounded"></div>
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-4">
                <div className="h-5 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-4">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
                <div className="h-10 w-full bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!testData) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-60px)] items-center justify-center bg-[#f8fafc] p-4 text-center">
          <div className="max-w-md bg-white p-6 rounded-2xl border border-red-150 shadow-sm">
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

  const questions = testData.questions || [];
  const totalQuestions = questions.length;

  const subjectDisplayName =
    subjects.find((s) => s.id === subjectId)?.name || testData.subject;
  const topicsDisplayName = testTopicIds
    .map((tId) => topics.find((t) => t.id === tId)?.name || tId)
    .join(", ");

  const subTopicsDisplayName =
    testData.sub_topics
      ?.map(
        (stId: string) =>
          subTopicsList.find((st) => st.id === stId)?.name || stId,
      )
      .join(", ") || "Application";

  const handleConfirmPublish = async () => {
    try {
      // Update test status to 'active' on server
      await updateTestMutation.mutateAsync({
        id: testData.id,
        payload: {
          status: "live",
        },
      });

      // Invalidate the tests list so the dashboard re-fetches with the new status
      queryClient.invalidateQueries({ queryKey: ['tests'] });
      // Also invalidate this specific test's query so test view reflects the change
      queryClient.invalidateQueries({ queryKey: ['test', testData.id] });
      setIsSuccessModalOpen(true);
    } catch (err) {
      console.error("Publish failed:", err);
      showNotification("Failed to publish test. Please try again.", "error");
    }
  };

  return (
    <MainLayout>
      <div className="flex h-[calc(100vh-60px)] w-full overflow-hidden bg-white -m-6 md:-m-8">
        {/* Left Sidebar Checklist */}
        <div className="w-[220px] shrink-0 border-r border-[#d9e5f7] bg-white flex flex-col h-full select-none">
          <div className="p-4 border-b border-[#f4f6fc] flex items-center justify-between">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Question creation
            </span>
            <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          <div className="p-3 px-4 bg-[#f8faff] border-b border-[#f0f4fe]">
            <span className="text-[11px] font-bold text-gray-400">
              Total Questions . {totalQuestions}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
            {questions.map((q, idx) => (
              <div
                key={q.id}
                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border bg-[#f4fbf7] border-emerald-250 text-emerald-700"
              >
                <div className="flex items-center gap-2 text-left truncate">
                  <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 border border-emerald-500 text-white flex items-center justify-center shrink-0">
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </div>
                  <span className="truncate">Question {idx + 1}</span>
                </div>
                <ChevronRight className="h-3 w-3 text-gray-300 shrink-0" />
              </div>
            ))}
          </div>
        </div>

        {/* Right Preview Content area */}
        <div className="flex-1 flex flex-col h-full overflow-y-auto bg-[#f8faff] p-6 md:p-8">
          <div className="max-w-4xl mx-auto w-full space-y-6 pb-12">
            {/* Header Badge */}
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-bold text-gray-800">Test creation</h1>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg shadow-2xs">
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                All {totalQuestions} Questions done
              </div>
            </div>

            {/* Test details preview card */}
            <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-4 relative">
              <button
                onClick={() => navigate(`/tests/editor/${testData.id}`)}
                className="absolute right-6 top-6 text-gray-400 hover:text-gray-650 cursor-pointer p-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100"
                title="Edit Test"
              >
                <Edit3 className="h-4 w-4" />
              </button>

              <div className="flex items-start gap-4 flex-col">
                <span className="bg-[#0b1b3e] text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                  {formatType(testData.type)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-gray-800">
                    {testData.name}
                  </span>
                  <span
                    className={`${getDifficultyColor(testData.difficulty)} text-[10px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 capitalize`}
                  >
                    <Award className="h-2.5 w-2.5" />
                    {testData.difficulty || "Easy"}
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-end border-t border-gray-50 pt-4">
                <div className="flex flex-col gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-16">Subject</span>
                    <span className="text-gray-300">:</span>
                    <span className="text-gray-700">{subjectDisplayName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-16">Topic</span>
                    <span className="text-gray-300">:</span>
                    <div className="flex flex-wrap gap-1">
                      {topicsDisplayName.split(",").map((t) => (
                        <Pill key={t} text={t.trim()} variant="yellow" />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 w-16">Sub Topic</span>
                    <span className="text-gray-300">:</span>
                    <Pill text={subTopicsDisplayName} variant="yellow" />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 text-[10px] font-bold text-[#6b7280]">
                  <div className="flex items-center gap-1.5 border border-gray-250 rounded-lg px-2.5 py-1.5 bg-white">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{testData.total_time || 60} Min</span>
                  </div>
                  <div className="flex items-center gap-1.5 border border-gray-250 rounded-lg px-2.5 py-1.5 bg-white">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    <span>{totalQuestions} Q's</span>
                  </div>
                  <div className="flex items-center gap-1.5 border border-gray-250 rounded-lg px-2.5 py-1.5 bg-white">
                    <Award className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {testData.total_marks || totalQuestions * 5} Marks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Switchable Publish Schedule Tabs */}
            <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-6">
              {/* Tab Selector */}
              <div className="inline-flex p-1 bg-[#f4f6fc] rounded-xl border border-gray-150 select-none">
                <button
                  type="button"
                  onClick={() => setActivePublishTab("Now")}
                  className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePublishTab === "Now"
                      ? "bg-white text-[#1f59da] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Publish Now
                </button>
                <button
                  type="button"
                  onClick={() => setActivePublishTab("Schedule")}
                  className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activePublishTab === "Schedule"
                      ? "bg-white text-[#1f59da] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Schedule Publish
                </button>
              </div>

              {/* Schedule Date & Time inputs */}
              {activePublishTab === "Schedule" && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-gray-800">
                    Select Date and Time
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full text-sm text-gray-500 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da] pr-10"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={customStartTime}
                        onChange={(e) => setCustomStartTime(e.target.value)}
                        className="w-full text-sm text-gray-500 bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da] appearance-none cursor-pointer"
                      >
                        <option value="">Select Time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <optgroup key={i} label={`${hour}:00`}>
                              <option value={`${hour}:00`}>{hour}:00</option>
                              <option value={`${hour}:30`}>{hour}:30</option>
                            </optgroup>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Live Until options block */}
              <div className="space-y-4 pt-2">
                <div>
                  <h3 className="text-sm font-bold text-gray-800">
                    Live Until
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 font-medium">
                    Choose how long this test should remain available on the
                    platform.
                  </p>
                </div>

                {/* Radio selection grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 gap-y-3">
                  {[
                    "Always Available",
                    "3 Weeks",
                    "1 Week",
                    "1 Month",
                    "2 Weeks",
                    "Custom Duration",
                  ].map((opt) => (
                    <label
                      key={opt}
                      className="flex items-center gap-3 text-xs text-gray-700 cursor-pointer select-none font-semibold"
                    >
                      <input
                        type="radio"
                        name="liveDuration"
                        checked={liveDurationOption === opt}
                        onChange={() => setLiveDurationOption(opt)}
                        className="sr-only"
                      />
                      <div
                        className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          liveDurationOption === opt
                            ? "border-[#1f59da] bg-white"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {liveDurationOption === opt && (
                          <div className="h-2 w-2 rounded-full bg-[#1f59da]" />
                        )}
                      </div>
                      <span>{opt}</span>
                    </label>
                  ))}
                </div>

                {/* Custom end duration selectors */}
                {liveDurationOption === "Custom Duration" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full text-sm text-gray-500 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da] pr-10"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    <div className="relative">
                      <select
                        value={customEndTime}
                        onChange={(e) => setCustomEndTime(e.target.value)}
                        className="w-full text-sm text-gray-500 bg-white px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da] appearance-none cursor-pointer"
                      >
                        <option value="">Select End Time</option>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, "0");
                          return (
                            <optgroup key={i} label={`${hour}:00`}>
                              <option value={`${hour}:00`}>{hour}:00</option>
                              <option value={`${hour}:30`}>{hour}:30</option>
                            </optgroup>
                          );
                        })}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-50">
                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="px-8 py-3 bg-[#f5f7ff] hover:bg-[#ebedfa] text-[#1f59da] text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmPublish}
                  disabled={updateTestMutation.isPending}
                  className="px-8 py-3 bg-[#1f59da] hover:bg-[#1546be] text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                >
                  {updateTestMutation.isPending ? "Publishing..." : "Confirm"}
                </button>
              </div>
            </div>

            {/* Questions preview details list */}
            <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-6">
              <h2 className="text-base font-bold text-gray-800 border-b border-gray-50 pb-3 flex justify-between items-center">
                <span>Questions Preview ({questions.length})</span>
                <button
                  onClick={() => navigate(`/tests/editor/${testData.id}`)}
                  className="text-xs text-[#1f59da] hover:underline font-bold flex items-center gap-1 cursor-pointer bg-[#f4f6fc] hover:bg-[#eef2ff] border px-3 py-1.5 rounded-lg transition-colors border-gray-150"
                >
                  <Edit3 className="h-3.5 w-3.5" /> Edit Questions
                </button>
              </h2>
              <div className="space-y-6 divide-y divide-gray-100">
                {questions.map((q, idx) => (
                  <div key={q.id || idx} className="pt-6 first:pt-0 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="font-semibold text-sm text-gray-800 flex items-center gap-3">
                        <span className="bg-[#f0f4fe] px-2 py-0.5 rounded text-xs text-[#1f59da] font-extrabold border border-[#d9e5f7]">
                          Q{idx + 1}
                        </span>
                        <div dangerouslySetInnerHTML={{ __html: q.question }} />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-gray-50 text-gray-400 px-2 py-0.5 rounded border border-gray-100">
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pl-10">
                      {[q.option1, q.option2, q.option3, q.option4].map(
                        (opt, oIdx) => {
                          const isCorrect =
                            q.correct_option === `option${oIdx + 1}`;
                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                                isCorrect
                                  ? "bg-emerald-50/50 border-emerald-300 text-emerald-800 font-bold"
                                  : "border-gray-150 text-gray-600 bg-gray-50/30"
                              }`}
                            >
                              <div
                                className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${
                                  isCorrect
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "border-gray-300"
                                }`}
                              >
                                {isCorrect && (
                                  <Check className="h-3 w-3" strokeWidth={3} />
                                )}
                              </div>
                              <span>{opt}</span>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="ml-10 text-xs text-gray-500 bg-[#f8faff] p-3.5 rounded-xl border border-dashed border-gray-200">
                        <strong className="text-gray-700">Explanation:</strong>{" "}
                        {q.explanation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal overlay */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-650/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-emerald-50 p-6 flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
              <Check className="h-6 w-6" strokeWidth={3} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-800">
                Test Published Successfully!
              </h3>
              <p className="text-xs text-gray-400 font-medium">
                The test has been published and is now active on PrepRoute.
              </p>
            </div>
            <button
              onClick={() => {
                setIsSuccessModalOpen(false);
                navigate("/");
              }}
              className="w-full py-2.5 bg-[#1f59da] hover:bg-[#1546be] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors shadow-sm"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default TestPublish;
