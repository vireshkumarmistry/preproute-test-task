import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import MainLayout from "../../components/MainLayout";
import {
  showNotification,
  isUuid,
  getDifficultyColor,
  formatType,
} from "../../utils/helper";
import RichTextEditor from "../../components/RichTextEditor";
import testSticker from "../../assets/test-sticker.svg";
import {
  useBulkCreateQuestions,
  useUpdateTest,
  useSubjects,
  useTopics,
  useMultiTopicsSubTopics,
} from "../../hooks/apiHooks";
import type { ApiQuestionInput, ApiQuestion } from "../../hooks/apiHooks";
import {
  ChevronsRight,
  ChevronLeft,
  ChevronsLeft,
  Plus,
  HelpCircle,
  Clock,
  Award,
  Trash2,
  RefreshCw,
  ChevronDown,
  Check,
  Pen,
  ChevronRight,
} from "lucide-react";

interface TestEditorProps {
  testDetails: {
    id: string;
    name: string;
    subject: string;
    topic?: string;
    subTopic?: string;
    duration: number;
    questionsCount: number;
    correctMarks: number;
    type?: string;
    difficulty?: string;
  };
  onExit: () => void;
  initialQuestions: QuestionItem[];
}

import type { QuestionItem } from "../../types/tests";

const SingleSelectDropdown = ({
  label,
  options,
  selectedId,
  onChange,
  disabled,
  placeholder = "Select option",
}: {
  label: string;
  options: { id: string; name: string }[];
  selectedId: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (id: string) => {
    onChange(id);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.id === selectedId);

  return (
    <div className="space-y-1 relative">
      <label className="text-[11px] font-bold text-gray-400">{label}</label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[38px] text-xs text-gray-500 bg-white px-3 py-2 rounded-lg border border-gray-200 flex items-center justify-between cursor-pointer disabled:bg-gray-50 select-none ${disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
      >
        {selectedOption ? (
          <span className="text-gray-700 font-semibold">
            {selectedOption.name}
          </span>
        ) : (
          <span className="text-gray-300">{placeholder}</span>
        )}
        <ChevronDown className="h-4 w-4 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 z-20">
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative mt-1 max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg z-20 p-1.5 space-y-0.5">
            {options.length === 0 ? (
              <div className="text-gray-400 text-[10px] p-2 text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => handleSelect(opt.id)}
                  className={`px-2.5 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer transition-colors text-xs text-gray-700 font-medium select-none ${selectedId === opt.id ? "bg-blue-50 text-[#1f59da]" : ""
                    }`}
                >
                  {opt.name}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const TestEditor = ({
  testDetails,
  onExit,
  initialQuestions,
}: TestEditorProps) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);
  const [activeIdx, setActiveIdx] = useState(0);

  const [showPublishSection, setShowPublishSection] = useState(false);
  const [activePublishTab, setActivePublishTab] = useState<"Now" | "Schedule">(
    "Now",
  );
  const [liveDurationOption, setLiveDurationOption] =
    useState<string>("Always Available");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customStartTime, setCustomStartTime] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [customEndTime, setCustomEndTime] = useState("");

  // Dynamic Metadata Fetching for Subject & Topics display mappings
  const { data: subjects = [] } = useSubjects();

  // Find subject UUID if testDetails.subject is a subject name (like "Sociology")
  const subjectId = testDetails.subject
    ? subjects.find(
      (s) => s.id === testDetails.subject || s.name === testDetails.subject,
    )?.id || (isUuid(testDetails.subject) ? testDetails.subject : "")
    : "";

  const { data: topics = [] } = useTopics(subjectId);

  const testTopicIds = (testDetails.topic || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

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

  // Map UUIDs to Names for clean UI display
  const subjectDisplayName =
    subjects.find((s) => s.id === subjectId)?.name || testDetails.subject;
  const topicsDisplayName = testTopicIds
    .map((id) => topics.find((t) => t.id === id || t.name === id)?.name || id)
    .join(", ");

  const testSubTopicIds = (testDetails.subTopic || "")
    .split(",")
    .map((st) => st.trim())
    .filter(Boolean);

  const subTopicsDisplayName = testSubTopicIds
    .map(
      (id) =>
        subTopicsList.find((st) => st.id === id || st.name === id)?.name || id,
    )
    .join(", ");

  const totalQuestions = questions.length;

  const queryClient = useQueryClient();
  const bulkCreateQuestions = useBulkCreateQuestions();
  const updateTest = useUpdateTest();

  // "Publish" action button in Header
  const publishButton = showPublishSection ? null : (
    <button
      onClick={async () => {
        const completedQuestions = questions.filter(
          (q) => q.isCompleted && q.text.trim().length > 0,
        );
        if (completedQuestions.length === 0) {
          showNotification(
            "Minimum 1 question required. Please complete at least one question before publishing.",
            "error",
          );
          return;
        }

        try {
          const questionsPayload: ApiQuestionInput[] = completedQuestions.map(
            (q) => {
              return {
                type: "mcq",
                question: q.text,
                option1: q.options[0] || "",
                option2: q.options[1] || "",
                option3: q.options[2] || "",
                option4: q.options[3] || "",
                correct_option: `option${(q.correctOptionIdx ?? 0) + 1}`,
                explanation: q.solution || "",
                difficulty: q.difficulty.toLowerCase(),
                test_id: testDetails.id,
                subject: subjectId || testDetails.subject,
                media_url: q.media_url || "",
              };
            },
          );

          // 1. Bulk create completed questions
          const createdQs =
            await bulkCreateQuestions.mutateAsync(questionsPayload);
          const questionIds = createdQs.map((q: ApiQuestion) => q.id);

          // 2. Update test with question IDs (keep status as draft or active for now)
          await updateTest.mutateAsync({
            id: testDetails.id,
            payload: {
              name: testDetails.name,
              questions: questionIds,
              total_questions: completedQuestions.length,
              total_marks: completedQuestions.length * testDetails.correctMarks,
            },
          });

          // 3. Invalidate / refetch tests to sync with server
          queryClient.invalidateQueries({ queryKey: ["tests"] });
          queryClient.invalidateQueries({ queryKey: ["test", testDetails.id] });

          setShowPublishSection(true);
        } catch (error) {
          console.error("Publish failed:", error);
          showNotification(
            "Failed to save questions. Please try again.",
            "error",
          );
        }
      }}
      disabled={bulkCreateQuestions.isPending || updateTest.isPending}
      className="bg-[#6366f1] hover:bg-[#5558e6] text-white text-xs font-semibold px-6 py-2.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      {bulkCreateQuestions.isPending || updateTest.isPending ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Saving...
        </>
      ) : (
        "Publish"
      )}
    </button>
  );

  const handleConfirmPublish = async () => {
    try {
      // Update test status to 'live' on server
      await updateTest.mutateAsync({
        id: testDetails.id,
        payload: {
          status: "live",
        },
      });

      queryClient.invalidateQueries({ queryKey: ["tests"] });
      queryClient.invalidateQueries({ queryKey: ["test", testDetails.id] });
      showNotification("Test Published Successfully!", "success");
      onExit();
    } catch (err) {
      console.error("Publish failed:", err);
      showNotification("Failed to publish test. Please try again.", "error");
    }
  };

  const currentQuestion = questions[activeIdx];

  const updateCurrentQuestion = (fields: Partial<QuestionItem>) => {
    setQuestions((prev) =>
      prev.map((q, idx) => {
        if (idx === activeIdx) {
          const updated = { ...q, ...fields };
          // Determine if question is completed
          const hasText = updated.text.trim().length > 0;
          const hasOptions = updated.options.some((o) => o.trim().length > 0);
          updated.isCompleted =
            hasText && hasOptions && updated.correctOptionIdx !== null;
          return updated;
        }
        return q;
      }),
    );
  };

  const handleOptionChange = (optIdx: number, val: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[optIdx] = val;
    updateCurrentQuestion({ options: newOptions });
  };

  const handleDeleteQuestionEdits = () => {
    updateCurrentQuestion({
      text: "",
      options: ["", "", "", ""],
      correctOptionIdx: null,
      solution: "",
      media_url: "",
      isCompleted: false,
    });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const parseCSV = (csvText: string) => {
        const lines: string[][] = [];
        let row: string[] = [];
        let inQuotes = false;
        let currentValue = "";

        for (let i = 0; i < csvText.length; i++) {
          const char = csvText[i];
          const nextChar = csvText[i + 1];

          if (char === '"') {
            if (inQuotes && nextChar === '"') {
              currentValue += '"';
              i++;
            } else {
              inQuotes = !inQuotes;
            }
          } else if (char === "," && !inQuotes) {
            row.push(currentValue.trim());
            currentValue = "";
          } else if ((char === "\r" || char === "\n") && !inQuotes) {
            if (char === "\r" && nextChar === "\n") {
              i++;
            }
            row.push(currentValue.trim());
            if (row.length > 1 || row[0] !== "") {
              lines.push(row);
            }
            row = [];
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        if (currentValue !== "" || row.length > 0) {
          row.push(currentValue.trim());
          lines.push(row);
        }
        return lines;
      };

      try {
        const parsed = parseCSV(text);
        if (parsed.length <= 1) {
          showNotification("CSV file is empty or invalid.", "error");
          return;
        }

        let startIndex = 0;
        const firstRow = parsed[0].map((c) => c.toLowerCase());
        const hasHeader = firstRow.some(
          (cell) =>
            cell.includes("question") ||
            cell.includes("option") ||
            cell.includes("correct") ||
            cell.includes("explanation") ||
            cell.includes("difficulty"),
        );
        if (hasHeader) {
          startIndex = 1;
        }

        const newQuestions: QuestionItem[] = [];
        for (let i = startIndex; i < parsed.length; i++) {
          const row = parsed[i];
          if (row.length < 5) continue;

          const questionText = row[0] || "";
          const opt1 = row[1] || "";
          const opt2 = row[2] || "";
          const opt3 = row[3] || "";
          const opt4 = row[4] || "";

          let correctIdx: number | null = null;
          const correctVal = row[5] || "";
          if (correctVal) {
            const parsedIdx = parseInt(correctVal, 10);
            if (!isNaN(parsedIdx)) {
              if (parsedIdx >= 1 && parsedIdx <= 4) {
                correctIdx = parsedIdx - 1;
              } else if (parsedIdx >= 0 && parsedIdx <= 3) {
                correctIdx = parsedIdx;
              }
            } else {
              const lowerCorrect = correctVal.toLowerCase();
              if (
                lowerCorrect.includes("option1") ||
                lowerCorrect === "1" ||
                lowerCorrect === "a"
              )
                correctIdx = 0;
              else if (
                lowerCorrect.includes("option2") ||
                lowerCorrect === "2" ||
                lowerCorrect === "b"
              )
                correctIdx = 1;
              else if (
                lowerCorrect.includes("option3") ||
                lowerCorrect === "3" ||
                lowerCorrect === "c"
              )
                correctIdx = 2;
              else if (
                lowerCorrect.includes("option4") ||
                lowerCorrect === "4" ||
                lowerCorrect === "d"
              )
                correctIdx = 3;
            }
          }

          const solution = row[6] || "";
          const difficulty = row[7] || "Easy";
          const topic = row[8] || testDetails.topic || "";
          const subtopic = row[9] || testDetails.subTopic || "";

          let formattedDifficulty = "Easy";
          if (difficulty.toLowerCase() === "medium")
            formattedDifficulty = "Medium";
          if (
            difficulty.toLowerCase() === "difficult" ||
            difficulty.toLowerCase() === "hard"
          )
            formattedDifficulty = "Difficult";

          newQuestions.push({
            id: Date.now() + i,
            text: questionText,
            options: [opt1, opt2, opt3, opt4],
            correctOptionIdx: correctIdx,
            solution: solution,
            difficulty: formattedDifficulty,
            topic: topic,
            subtopic: subtopic,
            isCompleted:
              questionText.trim().length > 0 &&
              opt1.trim().length > 0 &&
              opt2.trim().length > 0 &&
              correctIdx !== null,
          });
        }

        if (newQuestions.length === 0) {
          showNotification("No valid questions found in CSV.", "error");
          return;
        }

        setQuestions((prev) => {
          const updated = [...prev];
          for (let i = 0; i < newQuestions.length; i++) {
            const newQ = newQuestions[i];
            if (i < updated.length) {
              updated[i] = {
                ...updated[i],
                text: newQ.text,
                options: newQ.options,
                correctOptionIdx: newQ.correctOptionIdx,
                solution: newQ.solution,
                difficulty: newQ.difficulty,
                topic: newQ.topic || updated[i].topic,
                subtopic: newQ.subtopic || updated[i].subtopic,
                isCompleted: newQ.isCompleted,
                media_url: newQ.media_url || updated[i].media_url,
              };
            } else {
              updated.push(newQ);
            }
          }
          return updated;
        });
        setActiveIdx(0);
        showNotification(
          `Successfully imported ${newQuestions.length} questions from CSV!`,
          "success",
        );
      } catch (err) {
        console.error("CSV Parse Error", err);
        showNotification("Failed to parse CSV file.", "error");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleNext = () => {
    if (activeIdx < totalQuestions - 1) {
      setActiveIdx((prev) => prev + 1);
    }
  };

  const formatBreadcrumbTab = (type?: string) => {
    if (!type) return "Chapter Wise";
    if (type === "chapterwise") return "Chapter Wise";
    if (type === "pyq") return "PYQ";
    if (type === "mock test") return "Mock Test";
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <MainLayout
      headerAction={publishButton}
      customBreadcrumbs={[
        "Test Creation",
        "Create Test",
        formatBreadcrumbTab(testDetails.type),
      ]}
    >
      <div className="flex w-full bg-white -m-6 md:-m-8">
        {/* Secondary Sidebar - Question Selector */}
        <div className="w-[220px] shrink-0 border-r border-[#d9e5f7] bg-white flex flex-col select-none">
          {/* Header */}
          <div className="p-4 flex items-center justify-between">
            <span className="text-[12px] font-bold text-gray-500 uppercase tracking-wider">
              Question creation
            </span>
            <button className="text-[#8b98a5] hover:text-[#5c6e80] cursor-pointer bg-transparent border-none">
              <ChevronsLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Total Questions Tracker */}
          <div className="p-3 px-4">
            <span className="text-[11px] font-bold text-gray-400">
              Total Questions . {totalQuestions}
            </span>
          </div>

          {/* Questions list */}
          <div className="p-3 space-y-1.5 scrollbar-thin">
            {questions.map((q, idx) => {
              const isActive = idx === activeIdx;
              return (
                <div
                  key={q.id}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${isActive
                    ? "bg-[#eef2ff] border-[#1f59da] text-[#1f59da]"
                    : q.isCompleted
                      ? "bg-[#f4fbf7] border-emerald-200 text-emerald-700"
                      : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                    }`}
                >
                  <button
                    onClick={() => setActiveIdx(idx)}
                    className="flex-1 flex items-center gap-2 text-left cursor-pointer focus:outline-none"
                  >
                    <div
                      className={`h-4.5 w-4.5 rounded-full border flex items-center justify-center shrink-0 ${isActive && q.isCompleted
                          ? "bg-[#1f59da] border-[#1f59da] text-white"
                          : q.isCompleted
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : isActive
                              ? "border-[#1f59da]"
                              : "border-gray-300"
                        }`}
                    >
                      {q.isCompleted && (
                        <Check className="h-3 w-3" strokeWidth={3} />
                      )}
                    </div>
                    <span className="truncate">Question {idx + 1}</span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <ChevronsRight
                      className={`h-3 w-3 ${isActive ? "text-[#1f59da]" : "text-gray-300"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Form Work Area */}
        <div className="flex-1 flex flex-col bg-white">
          <div className="w-full space-y-6 p-6 md:p-8">
            {showPublishSection && (
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-gray-800">
                  Test created
                </h1>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-lg shadow-2xs">
                  <div className="h-2 w-2 rounded-full bg-emerald-500" />
                  All {totalQuestions} Questions done
                </div>
              </div>
            )}
            {/* Summary Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#d9e5f7] space-y-4">
              {/* First Row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="flex justify-between w-full">
                  <div className="flex items-start gap-4 flex-col">
                    <span className="bg-[#0b1b3e] text-white text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider">
                      {formatType(testDetails.type)}
                    </span>
                    <div className="flex gap-2">
                      <img src={testSticker} className="h-4 w-4" />
                      <span className="text-sm font-bold text-gray-800">
                        {testDetails.name}
                      </span>
                      <span
                        className={`${getDifficultyColor(testDetails.difficulty)} text-[10px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 capitalize`}
                      >
                        <Award className="h-2.5 w-2.5" />
                        {testDetails.difficulty || "Easy"}
                      </span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-650 cursor-pointer items-start">
                    <Pen className="h-4 w-4" color="#5988EF" />
                  </button>
                </div>
              </div>

              {/* Second Row */}
              <div className="flex justify-between">
                <div className="flex flex-col gap-4 sm:flex-col sm:items-start text-xs font-semibold">
                  <div className="flex items-center gap-1">
                    <span className="w-16 text-gray-400 font-normal">
                      Subject
                    </span>
                    <span className="text-gray-300 mr-2">:</span>
                    <span className="text-[#4b5563]">{subjectDisplayName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-16 text-gray-400 font-normal">
                      Topic
                    </span>
                    <span className="text-gray-300 mr-2">:</span>
                    <div className="flex flex-wrap gap-1">
                      {topicsDisplayName ? (
                        topicsDisplayName.split(",").map((item) => (
                          <span
                            key={item}
                            className="bg-white text-[#fbbf24] border border-[#facc15] px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize"
                          >
                            {item.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="bg-white text-[#fbbf24] border border-[#facc15] px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize">
                          General
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-16 text-gray-400 font-normal">
                      Sub Topic
                    </span>
                    <span className="text-gray-300 mr-2">:</span>
                    {subTopicsDisplayName.split(",").map((item, idx) => (
                      <span
                        key={idx}
                        className="bg-white text-[#fbbf24] border border-[#facc15] px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-end gap-2 text-[10px] font-bold text-[#6b7280] self-end sm:self-end">
                  <div className="flex items-center gap-1.5 border border-gray-250 rounded-lg px-2.5 py-1.5 bg-white">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{testDetails.duration} Min</span>
                  </div>
                  <div className="flex items-center gap-1.5 border border-gray-250 rounded-lg px-2.5 py-1.5 bg-white">
                    <HelpCircle className="h-3.5 w-3.5 text-gray-400" />
                    <span>{totalQuestions} Q's</span>
                  </div>
                  <div className="flex items-center gap-1.5 border border-gray-250 rounded-lg px-2.5 py-1.5 bg-white">
                    <Award className="h-3.5 w-3.5 text-gray-400" />
                    <span>
                      {totalQuestions * testDetails.correctMarks} Marks
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!showPublishSection ? (
              /* Question Edit Panel */
              <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-5">
                {/* Question Label Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-base font-bold text-text-heading">
                      Question {activeIdx + 1}
                    </span>
                    <span className="text-xs font-bold text-gray-300 ml-1">
                      /{totalQuestions}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setQuestions([
                          ...questions,
                          {
                            id: Date.now(),
                            text: "",
                            options: ["", "", "", ""],
                            correctOptionIdx: null,
                            solution: "",
                            difficulty: "easy",
                            topic: testDetails.topic || "",
                            subtopic: testDetails.subTopic || "",
                            isCompleted: false,
                          },
                        ]);
                        setActiveIdx(questions.length);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      MCQ
                    </button>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 cursor-pointer">
                      <RefreshCw className="h-3.5 w-3.5" />
                      CSV
                      <input
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleCSVUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Delete edits button */}
                <button
                  onClick={handleDeleteQuestionEdits}
                  className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete All Edits
                </button>

                {/* Question Text Editor */}
                <div className="relative">
                  <RichTextEditor
                    key={`${activeIdx}-text`}
                    value={currentQuestion.text}
                    onChange={(html) => updateCurrentQuestion({ text: html })}
                    placeholder="Type Question Text here"
                  />
                  <button
                    onClick={() => updateCurrentQuestion({ text: "" })}
                    className="absolute right-4 bottom-4 z-10 text-gray-300 hover:text-red-500 cursor-pointer"
                    title="Clear question text"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Options block */}
                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700">
                    Type the options below
                  </span>
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateCurrentQuestion({ correctOptionIdx: optIdx })
                          }
                          className={`h-5.5 w-5.5 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${currentQuestion.correctOptionIdx === optIdx
                            ? "border-[#2563eb] text-[#2563eb]"
                            : "border-gray-300"
                            }`}
                        >
                          {currentQuestion.correctOptionIdx === optIdx && (
                            <div className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                          )}
                        </button>
                        <div className="relative flex-1">
                          <input
                            type="text"
                            placeholder={`Option ${optIdx + 1}`}
                            value={option}
                            onChange={(e) =>
                              handleOptionChange(optIdx, e.target.value)
                            }
                            className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da] placeholder-gray-300 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => handleOptionChange(optIdx, "")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Solution Block */}
                <div className="space-y-3">
                  <span className="block text-sm font-semibold text-gray-700">
                    Add Solution Explanation
                  </span>
                  <div className="relative">
                    <textarea
                      placeholder="Type Solution Explanation here"
                      value={currentQuestion.solution}
                      onChange={(e) =>
                        updateCurrentQuestion({ solution: e.target.value })
                      }
                      rows={4}
                      className="w-full text-sm px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da] placeholder-gray-300 bg-white min-h-[120px] resize-y pr-10"
                    />
                    <button
                      onClick={() => updateCurrentQuestion({ solution: "" })}
                      className="absolute right-4 bottom-4 z-10 text-gray-300 hover:text-red-500 cursor-pointer"
                      title="Clear solution text"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Previous/Next Question Navigation */}
                <div className="flex items-center justify-center gap-8 py-2">
                  <button
                    onClick={() => setActiveIdx((prev) => Math.max(prev - 1, 0))}
                    disabled={activeIdx === 0}
                    className="p-2 text-gray-400 hover:text-[#1f59da] hover:bg-[#f0f4fe] rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer"
                    title="Previous Question"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={activeIdx === totalQuestions - 1}
                    className="p-2 text-gray-400 hover:text-[#1f59da] hover:bg-[#f0f4fe] rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 cursor-pointer"
                    title="Next Question"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Question Settings dropdowns */}
                <div className="border-t border-gray-100 pt-6 space-y-4">
                  <span className="block text-sm font-bold text-gray-700">
                    Question settings
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Level of Difficulty */}
                    <SingleSelectDropdown
                      label="Level of Difficulty"
                      options={[
                        { id: "Easy", name: "Easy" },
                        { id: "Medium", name: "Medium" },
                        { id: "Difficult", name: "Difficult" },
                      ]}
                      selectedId={currentQuestion.difficulty}
                      onChange={(val) =>
                        updateCurrentQuestion({ difficulty: val })
                      }
                    />

                    {/* Topic */}
                    <SingleSelectDropdown
                      label="Topic"
                      options={topics.map((t) => ({
                        id: t.name,
                        name: t.name,
                      }))}
                      selectedId={currentQuestion.topic}
                      onChange={(val) => updateCurrentQuestion({ topic: val })}
                      placeholder="Choose Topic"
                    />

                    {/* Sub-topic */}
                    <SingleSelectDropdown
                      label="Sub-topic"
                      options={subTopicsList.map((st) => ({
                        id: st.name,
                        name: st.name,
                      }))}
                      selectedId={currentQuestion.subtopic}
                      onChange={(val) =>
                        updateCurrentQuestion({ subtopic: val })
                      }
                      disabled={subTopicsList.length === 0}
                      placeholder="Choose Sub-topic"
                    />
                  </div>
                </div>

                {/* Bottom Actions footer */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <button
                    type="button"
                    onClick={onExit}
                    className="px-5 py-2.5 bg-[#fef2f2] hover:bg-[#fee2e2] text-red-500 text-xs font-bold rounded-lg cursor-pointer transition-colors"
                  >
                    Exit Test Creation
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    disabled={activeIdx === totalQuestions - 1}
                    className="px-8 py-2.5 bg-[#6366f1] hover:bg-[#5558e6] text-white text-xs font-bold rounded-lg cursor-pointer transition-colors disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            ) : (
              /* Publish Settings Panel */
              <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-6 animate-in fade-in duration-150">
                {/* Tab Selector */}
                <div className="inline-flex p-1 bg-[#f4f6fc] rounded-xl select-none">
                  <button
                    type="button"
                    onClick={() => setActivePublishTab("Now")}
                    className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activePublishTab === "Now"
                      ? "bg-white text-[#1f59da] shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    Publish Now
                  </button>
                  <button
                    type="button"
                    onClick={() => setActivePublishTab("Schedule")}
                    className={`px-6 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${activePublishTab === "Schedule"
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
                          className="w-full text-sm text-gray-500 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da]"
                        />
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
                <div className="space-y-4 pt-2 gap-3">
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 gap-y-8">
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
                          className={`h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${liveDurationOption === opt
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
                          className="w-full text-sm text-gray-500 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-1 focus:ring-[#1f59da]"
                        />
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
                    onClick={() => setShowPublishSection(false)}
                    className="px-8 py-3 bg-[#f5f7ff] hover:bg-[#ebedfa] text-[#1f59da] text-sm font-semibold rounded-xl cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPublish}
                    disabled={updateTest.isPending}
                    className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                  >
                    {updateTest.isPending ? "Publishing..." : "Confirm"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </MainLayout>
  );
};

export default TestEditor;
