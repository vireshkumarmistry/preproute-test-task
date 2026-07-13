import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/MainLayout";
import {
  useGetTest,
  useSubjects,
  useTopics,
  useMultiTopicsSubTopics,
  useFetchBulkQuestions,
} from "../../hooks/apiHooks";
import {
  ChevronLeft,
  Award,
  Clock,
  HelpCircle,
  Check,
  Pen,
  Info,
  BookOpen,
} from "lucide-react";
import type { ApiQuestion } from "../../hooks/apiHooks";
import {
  isUuid,
  getDifficultyColor,
  formatType,
  getStatusStyle,
} from "../../utils/helper";

const TestView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: testData, isLoading } = useGetTest(id || "");

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

  // Extract question IDs if they are strings, otherwise they might be full objects
  const rawQuestions = (testData?.questions as (string | ApiQuestion)[]) || [];
  const questionIds = rawQuestions.filter(
    (q): q is string => typeof q === "string",
  );

  // Fetch full details if we only have IDs
  const { data: bulkQuestions, isLoading: isBulkLoading } =
    useFetchBulkQuestions(questionIds);

  if (isLoading || (questionIds.length > 0 && isBulkLoading)) {
    return (
      <MainLayout>
        <div className="space-y-6 p-4 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-9 w-32 bg-gray-200 rounded-lg"></div>
            <div className="h-9 w-36 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#d9e5f7]">
            <div className="space-y-2 flex-1">
              <div className="h-6 w-24 bg-gray-200 rounded"></div>
              <div className="h-7 w-48 bg-gray-200 rounded"></div>
            </div>
            <div className="h-10 w-48 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-4">
            <div className="h-5 w-32 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-6">
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="space-y-3">
              <div className="h-20 bg-gray-100 rounded-xl"></div>
              <div className="h-20 bg-gray-100 rounded-xl"></div>
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

  const resolvedQuestions: ApiQuestion[] =
    questionIds.length > 0
      ? bulkQuestions || []
      : (rawQuestions as ApiQuestion[]);

  const totalQuestions = resolvedQuestions.length;

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

  return (
    <MainLayout>
      <div className="space-y-6 pb-12 p-4 md:p-6">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-705 cursor-pointer bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-2xs hover:bg-slate-50 hover:shadow-xs transition-all w-fit"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <button
            onClick={() => navigate(`/tests/editor/${testData.id}`)}
            className="flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#1f59da] hover:bg-[#1546be] px-5 py-2.5 rounded-xl shadow-md shadow-[#1f59da]/20 cursor-pointer transition-all hover:-translate-y-0.5"
          >
            <Pen className="h-4 w-4" />
            Edit Test
          </button>
        </div>

        {/* Hero Card */}
        <div className="relative overflow-hidden bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
          {/* Decorative background shape */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-[#1f59da]/5 to-[#1f59da]/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-extrabold px-3 py-1 rounded-md uppercase tracking-wider">
                  {formatType(testData.type)}
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[10px] font-extrabold border ${getStatusStyle(testData.status)}`}
                >
                  {testData.status === "active" || testData.status === "live"
                    ? "Live"
                    : testData.status === "completed"
                      ? "Unpublished"
                      : testData.status || "Draft"}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-tight">
                {testData.name}
              </h1>
            </div>

            {/* Quick Metrics */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                <div className="p-2 bg-blue-50 text-[#1f59da] rounded-xl">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                  <p className="text-sm font-extrabold text-slate-700">{testData.total_time || 60} Min</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <HelpCircle className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</p>
                  <p className="text-sm font-extrabold text-slate-700">{totalQuestions} Qs</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl px-4 py-3 shadow-2xs">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Award className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                  <p className="text-sm font-extrabold text-slate-700">{testData.total_marks || totalQuestions * 5} Pts</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Metadata Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BookOpen className="h-5 w-5 text-[#1f59da]" />
              <h2 className="text-base font-bold text-slate-800">
                Academic Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Subject</span>
                <p className="text-sm font-bold text-slate-700">{subjectDisplayName}</p>
              </div>

              <div className="space-y-1 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Difficulty Level</span>
                <div className="flex items-center mt-0.5">
                  <span
                    className={`${getDifficultyColor(testData.difficulty)} text-xs font-bold px-3 py-1 rounded-lg flex items-center gap-1.5 capitalize`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    {testData.difficulty || "Easy"}
                  </span>
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic(s)</span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {topicsDisplayName ? (
                    topicsDisplayName
                      .split(",")
                      .map((t) => (
                        <span key={t} className="bg-white text-[#b45309] border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold shadow-2xs">
                          {t.trim()}
                        </span>
                      ))
                  ) : (
                    <span className="text-xs text-slate-400 font-semibold italic">No topics assigned</span>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sub-Topic</span>
                <div className="mt-1">
                  <span className="bg-white text-[#b45309] border border-amber-200 px-3 py-1 rounded-lg text-xs font-bold shadow-2xs">
                    {subTopicsDisplayName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scoring System Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Award className="h-5 w-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-800">
                Scoring Rules
              </h2>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-emerald-50/40 rounded-2xl border border-emerald-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-700">Correct Answer</p>
                  <p className="text-[10px] text-slate-400 font-medium">Marks awarded per question</p>
                </div>
                <span className="text-2xl font-black text-emerald-600 bg-white px-3 py-1 rounded-xl border border-emerald-200 shadow-2xs">
                  +{testData.correct_marks || 4}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 bg-red-50/40 rounded-2xl border border-red-100">
                <div className="space-y-0.5">
                  <p className="text-sm font-bold text-slate-700">Negative Marking</p>
                  <p className="text-[10px] text-slate-400 font-medium">Marks deducted per wrong answer</p>
                </div>
                <span className="text-2xl font-black text-red-500 bg-white px-3 py-1 rounded-xl border border-red-200 shadow-2xs">
                  {testData.wrong_marks || 1}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-500">
                  <span>Pass Threshold</span>
                  <span>50%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-[#1f59da] h-2 rounded-full" style={{ width: "50%" }}></div>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold leading-relaxed mt-1">
                  Students must score at least half of the total marks to pass this exam.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Questions list */}
        <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h2 className="text-lg font-black text-slate-800 tracking-tight">
                Exam Paper Preview
              </h2>
              <p className="text-xs font-medium text-slate-400">
                Review all {totalQuestions} questions and configurations below
              </p>
            </div>
          </div>

          {totalQuestions === 0 ? (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-sm font-bold text-slate-700">No questions found</h3>
              <p className="text-xs text-slate-400 mt-1">
                You can add questions by editing this test.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {resolvedQuestions.map((q, idx) => (
                <div key={q.id || idx} className="group relative bg-white p-6 rounded-2xl border border-slate-200/85 hover:border-slate-350 hover:shadow-md transition-all duration-300">
                  {/* Left Accent Bar on Hover */}
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1f59da] rounded-l-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                  <div className="flex flex-col gap-5">
                    {/* Question Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3.5">
                        <span className="flex items-center justify-center bg-blue-50 text-[#1f59da] text-xs font-black px-3 py-1.5 rounded-xl border border-blue-100 shrink-0 shadow-2xs">
                          Q{idx + 1}
                        </span>
                        <div
                          className="prose prose-sm max-w-none text-slate-700 font-semibold leading-relaxed question-html mt-0.5"
                          dangerouslySetInnerHTML={{ __html: q.question }}
                        />
                      </div>
                      <span className="text-[10px] font-extrabold uppercase bg-slate-50 text-slate-400 px-2.5 py-1 rounded-md border border-slate-100 shrink-0">
                        {q.difficulty}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-0 md:pl-12">
                      {[q.option1, q.option2, q.option3, q.option4].map(
                        (opt, oIdx) => {
                          const isCorrect =
                            q.correct_option === `option${oIdx + 1}`;
                          const optionLabel = String.fromCharCode(65 + oIdx); // A, B, C, D
                          return (
                            <div
                              key={oIdx}
                              className={`p-4 rounded-2xl border flex items-center gap-3.5 transition-all duration-200 ${isCorrect
                                  ? "bg-emerald-50/40 border-emerald-300 text-emerald-800 font-bold shadow-2xs"
                                  : "border-slate-200 text-slate-650 bg-slate-50/20 hover:border-slate-300 hover:bg-slate-50/40"
                                }`}
                            >
                              <div
                                className={`h-6 w-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold border transition-colors ${isCorrect
                                    ? "bg-emerald-500 border-emerald-500 text-white"
                                    : "bg-white border-slate-200 text-slate-400"
                                  }`}
                              >
                                {isCorrect ? (
                                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                                ) : (
                                  optionLabel
                                )}
                              </div>
                              <span className="text-xs">{opt}</span>
                            </div>
                          );
                        },
                      )}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="pl-0 md:pl-12">
                        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-2">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                            <Info className="h-4 w-4 text-slate-400" />
                            <span>Explanation</span>
                          </div>
                          <div
                            className="text-xs text-slate-500 leading-relaxed question-html font-medium"
                            dangerouslySetInnerHTML={{ __html: q.explanation }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default TestView;
