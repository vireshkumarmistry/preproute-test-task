import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { showNotification, isUuid } from "../../utils/helper";
import {
  useSubjects,
  useTopics,
  useMultiTopicsSubTopics,
  useCreateTest,
  useGetTest,
  useUpdateTest,
} from "../../hooks/apiHooks";

interface TestCreationFormProps {
  onCancel: () => void;
  onTabChange?: (tab: "Chapterwise" | "PYQ" | "Mock Test") => void;
  onSubmit?: (testData: {
    id: string;
    name: string;
    subject: string;
    topic: string;
    subTopic: string;
    duration: number;
    questionsCount: number;
    correctMarks: number;
  }) => void;
  testId?: string;
}

const MultiSelectDropdown = ({
  label,
  options,
  selectedIds,
  onChange,
  disabled,
  error,
  placeholder = "Select options",
}: {
  label: string;
  options: { id: string; name: string }[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  disabled?: boolean;
  error?: string;
  placeholder?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOption = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((item) => item !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOption = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedIds.filter((item) => item !== id));
  };

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

  return (
    <div className="space-y-2 relative">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full min-h-[46px] text-sm text-gray-500 bg-white px-4 py-2 rounded-xl border flex flex-wrap items-center gap-1.5 cursor-pointer disabled:bg-gray-50 select-none ${error ? "border-red-500 bg-red-50/10" : "border-gray-200"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {selectedOptions.length === 0 ? (
          <span className="text-gray-300">{placeholder}</span>
        ) : (
          selectedOptions.map((opt) => (
            <span
              key={opt.id}
              className="inline-flex items-center gap-1 bg-[#f0f4fe] text-[#1f59da] text-xs font-semibold px-2.5 py-1 rounded-md border border-blue-100"
            >
              {opt.name}
              <button
                type="button"
                onClick={(e) => removeOption(opt.id, e)}
                className="hover:text-red-500 focus:outline-none ml-1 font-bold"
              >
                &times;
              </button>
            </span>
          ))
        )}
        <ChevronDown className="ml-auto h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      {isOpen && !disabled && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-2 space-y-1">
            {options.length === 0 ? (
              <div className="text-gray-400 text-xs p-2 text-center">
                No options available
              </div>
            ) : (
              options.map((opt) => {
                const isChecked = selectedIds.includes(opt.id);
                return (
                  <div
                    key={opt.id}
                    onClick={() => toggleOption(opt.id)}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => { }} // handled by onClick on parent div
                      className="rounded border-gray-300 text-[#1f59da] focus:ring-[#1f59da] h-4 w-4 pointer-events-none"
                    />
                    <span className="text-sm text-gray-700 font-medium select-none">
                      {opt.name}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {error && (
        <p className="text-red-500 text-xs font-semibold mt-1">{error}</p>
      )}
    </div>
  );
};

import Dropdown from "../../components/Dropdown";

const TestCreationForm = ({
  onCancel,
  onTabChange,
  onSubmit,
  testId,
}: TestCreationFormProps) => {
  const [activeTab, setActiveTab] = useState<
    "Chapterwise" | "PYQ" | "Mock Test"
  >("Chapterwise");

  useEffect(() => {
    if (onTabChange) {
      onTabChange(activeTab);
    }
  }, [activeTab, onTabChange]);

  // Custom states for cascading API calls
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedTopicIds, setSelectedTopicIds] = useState<string[]>([]);
  const [selectedSubTopicIds, setSelectedSubTopicIds] = useState<string[]>([]);

  const [subject, setSubject] = useState("");
  const [nameOfTest, setNameOfTest] = useState("");
  const [duration, setDuration] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Difficult">(
    "Easy",
  );

  // React Query calls
  const { data: subjects = [], isLoading: isLoadingSubjects } = useSubjects();
  const { data: topics = [], isLoading: isLoadingTopics } =
    useTopics(selectedSubjectId);
  const { data: subTopics = [], isLoading: isLoadingSubTopics } =
    useMultiTopicsSubTopics(selectedTopicIds);

  const createTestMutation = useCreateTest();
  const updateTestMutation = useUpdateTest();
  const { data: testData, isLoading: isLoadingTest } = useGetTest(testId || "");
  const [isPrefilled, setIsPrefilled] = useState(false);

  // Marking scheme counters
  const [wrongAnswer, setWrongAnswer] = useState(-1);
  const [unattempted, setUnattempted] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState(5);

  const [noOfQuestions, setNoOfQuestions] = useState("");
  const [totalMarks, setTotalMarks] = useState("");

  useEffect(() => {
    if (testId && testData && subjects.length > 0 && !isPrefilled) {
      setNameOfTest(testData.name || "");
      if (testData.type === "chapterwise") setActiveTab("Chapterwise");
      else if (testData.type === "pyq") setActiveTab("PYQ");
      else if (testData.type === "mock test" || testData.type === "mock_test")
        setActiveTab("Mock Test");

      if (testData.subject) {
        const subj = subjects.find(
          (s) => s.id === testData.subject || s.name === testData.subject,
        );
        if (subj) {
          setSelectedSubjectId(subj.id);
          setSubject(subj.name);
        } else {
          setSelectedSubjectId(testData.subject);
        }
      }
      if (testData.topics) {
        setSelectedTopicIds(testData.topics);
      }
      if (testData.sub_topics) {
        setSelectedSubTopicIds(testData.sub_topics);
      }
      setDuration(testData.total_time ? testData.total_time.toString() : "");
      if (testData.difficulty) {
        const diff =
          testData.difficulty.charAt(0).toUpperCase() +
          testData.difficulty.slice(1).toLowerCase();
        if (diff === "Easy" || diff === "Medium" || diff === "Difficult") {
          setDifficulty(diff as "Easy" | "Medium" | "Difficult");
        }
      }
      if (testData.wrong_marks !== undefined)
        setWrongAnswer(testData.wrong_marks);
      if (testData.unattempt_marks !== undefined)
        setUnattempted(testData.unattempt_marks);
      if (testData.correct_marks !== undefined)
        setCorrectAnswer(testData.correct_marks);
      setNoOfQuestions(
        testData.total_questions ? testData.total_questions.toString() : "",
      );
      setTotalMarks(
        testData.total_marks ? testData.total_marks.toString() : "",
      );

      setIsPrefilled(true);
    }
  }, [testId, testData, subjects, isPrefilled]);

  // Auto-calculate total marks: questions × correct marks
  useEffect(() => {
    const q = parseInt(noOfQuestions);
    if (!isNaN(q) && q > 0) {
      setTotalMarks((q * correctAnswer).toString());
    } else {
      setTotalMarks("");
    }
  }, [noOfQuestions, correctAnswer]);

  // Resolve topic and subtopic names to UUIDs once the metadata list loads
  useEffect(() => {
    if (!testId || !testData) return;

    if (topics.length > 0) {
      setSelectedTopicIds((prev) =>
        prev.map((tid) => {
          if (isUuid(tid)) return tid;
          const found = topics.find((t) => t.name === tid || t.id === tid);
          return found ? found.id : tid;
        }),
      );
    }
  }, [topics, testData, testId]);

  useEffect(() => {
    if (!testId || !testData) return;
    const isUuid = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val,
      );

    if (subTopics.length > 0) {
      setSelectedSubTopicIds((prev) =>
        prev.map((stid) => {
          if (isUuid(stid)) return stid;
          const found = subTopics.find(
            (st) => st.name === stid || st.id === stid,
          );
          return found ? found.id : stid;
        }),
      );
    }
  }, [subTopics, testData, testId]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Cascading change handlers
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subjectId = e.target.value;
    setSelectedSubjectId(subjectId);

    const selectedSubj = subjects.find((s) => s.id === subjectId);
    setSubject(selectedSubj ? selectedSubj.name : "");

    // Reset topic and sub-topic since subject changed
    setSelectedTopicIds([]);
    setSelectedSubTopicIds([]);
    setValidationErrors((prev) => ({
      ...prev,
      subject: "",
      topic: "",
      subTopic: "",
    }));
  };

  const handleTopicIdsChange = (ids: string[]) => {
    setSelectedTopicIds(ids);
    setValidationErrors((prev) => ({ ...prev, topic: "" }));
  };

  const handleSubTopicIdsChange = (ids: string[]) => {
    setSelectedSubTopicIds(ids);
    setValidationErrors((prev) => ({ ...prev, subTopic: "" }));
  };

  // Reset selected sub-topics if they are no longer in the newly fetched subTopics list
  useEffect(() => {
    if (testId && !isPrefilled) return;
    if (isLoadingSubTopics) return;
    const isUuid = (val: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        val,
      );
    if (selectedSubTopicIds.length > 0 && subTopics.length > 0) {
      const validIds = selectedSubTopicIds.filter(
        (stId) => !isUuid(stId) || subTopics.some((st) => st.id === stId),
      );
      if (validIds.length !== selectedSubTopicIds.length) {
        setSelectedSubTopicIds(validIds);
      }
    }
  }, [subTopics, selectedSubTopicIds, isLoadingSubTopics, testId, isPrefilled]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!nameOfTest.trim()) {
      errors.name = "Test Name is required";
    }
    if (!selectedSubjectId) {
      errors.subject = "Subject is required";
    }
    if (selectedTopicIds.length === 0) {
      errors.topic = "At least one Topic is required";
    }
    if (selectedSubTopicIds.length === 0) {
      errors.subTopic = "At least one Sub Topic is required";
    }
    if (!duration.trim() || isNaN(Number(duration)) || Number(duration) <= 0) {
      errors.duration = "Duration must be a positive number";
    }
    if (
      !noOfQuestions.trim() ||
      isNaN(Number(noOfQuestions)) ||
      Number(noOfQuestions) <= 0
    ) {
      errors.noOfQuestions = "It must be a positive number";
    }
    if (
      !totalMarks.trim() ||
      isNaN(Number(totalMarks)) ||
      Number(totalMarks) <= 0
    ) {
      errors.totalMarks = "Total marks must be a positive number";
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (
    e: React.FormEvent,
    isNextAction: boolean,
  ) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    const typeMapping: Record<string, string> = {
      Chapterwise: "chapterwise",
      PYQ: "pyq",
      "Mock Test": "mock test",
    };

    const topicsStr = topics
      .filter((t) => selectedTopicIds.includes(t.id))
      .map((t) => t.name)
      .join(", ");
    const subTopicsStr = subTopics
      .filter((st) => selectedSubTopicIds.includes(st.id))
      .map((st) => st.name)
      .join(", ");

    try {
      if (testId) {
        await updateTestMutation.mutateAsync({
          id: testId,
          payload: {
            name: nameOfTest,
            type: typeMapping[activeTab] || "chapterwise",
            subject: selectedSubjectId,
            topics: selectedTopicIds,
            sub_topics: selectedSubTopicIds,
            correct_marks: correctAnswer,
            wrong_marks: wrongAnswer,
            unattempt_marks: unattempted,
            difficulty: difficulty.toLowerCase(),
            total_time: parseInt(duration) || 60,
            total_marks: parseInt(totalMarks) || 100,
            total_questions: parseInt(noOfQuestions) || 50,
          },
        });
        if (onSubmit) {
          onSubmit({
            id: testId,
            name: nameOfTest,
            subject: subject,
            topic: topicsStr,
            subTopic: subTopicsStr,
            duration: parseInt(duration) || 60,
            questionsCount: parseInt(noOfQuestions) || 50,
            correctMarks: correctAnswer,
          });
        } else {
          onCancel();
        }
      } else {
        const createdTest = await createTestMutation.mutateAsync({
          name: nameOfTest,
          type: typeMapping[activeTab] || "chapterwise",
          subject: selectedSubjectId,
          topics: selectedTopicIds,
          sub_topics: selectedSubTopicIds,
          correct_marks: correctAnswer,
          wrong_marks: wrongAnswer,
          unattempt_marks: unattempted,
          difficulty: difficulty.toLowerCase(),
          total_time: parseInt(duration) || 60,
          total_marks: parseInt(totalMarks) || 100,
          total_questions: parseInt(noOfQuestions) || 50,
          status: isNextAction ? "live" : "draft",
        });

        if (isNextAction && onSubmit) {
          onSubmit({
            id: createdTest.id,
            name: createdTest.name,
            subject: subject,
            topic: topicsStr,
            subTopic: subTopicsStr,
            duration: createdTest.total_time,
            questionsCount: createdTest.total_questions,
            correctMarks: createdTest.correct_marks,
          });
        } else {
          onCancel();
        }
      }
    } catch (err) {
      console.error(
        testId ? "Failed to update test:" : "Failed to create test:",
        err,
      );
      showNotification(
        testId
          ? "Failed to update test on server. Please check your data and try again."
          : "Failed to create test on server. Please check your data and try again.",
        "error",
      );
    }
  };

  if (testId && isLoadingTest) {
    return (
      <div className="bg-white rounded-2xl animate-pulse space-y-6">
        {/* Tabs Skeleton */}
        <div className="inline-flex p-1 bg-gray-100 rounded-xl mb-4 w-64 h-10"></div>

        {/* Fields Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-[46px] w-full bg-gray-100 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-[46px] w-full bg-gray-100 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded"></div>
              <div className="h-[46px] w-full bg-gray-100 rounded-xl"></div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="h-4 w-28 bg-gray-200 rounded"></div>
              <div className="h-[46px] w-full bg-gray-100 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-24 bg-gray-200 rounded"></div>
              <div className="h-[46px] w-full bg-gray-100 rounded-xl"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 w-36 bg-gray-200 rounded"></div>
              <div className="flex gap-8 h-[46px] items-center">
                <div className="h-5 w-20 bg-gray-100 rounded"></div>
                <div className="h-5 w-20 bg-gray-100 rounded"></div>
                <div className="h-5 w-20 bg-gray-100 rounded"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Marking Scheme Header Skeleton */}
        <div className="pt-4 border-t border-gray-50">
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
        </div>

        {/* Marking Scheme row skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-3 w-20 bg-gray-200 rounded"></div>
              <div className="h-12 w-full bg-gray-100 rounded-xl"></div>
            </div>
          ))}
        </div>

        {/* Buttons skeleton */}
        <div className="flex justify-end gap-4 pt-8">
          <div className="h-11 w-24 bg-gray-100 rounded-xl"></div>
          <div className="h-11 w-24 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8">
      {/* Chapterwise / PYQ / Mock Test Tabs */}
      <div className="inline-flex p-1.5 bg-slate-100/80 rounded-xl mb-8 select-none border border-slate-200/50">
        {(["Chapterwise", "PYQ", "Mock Test"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-8 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === tab
              ? "bg-white text-[#1f59da] shadow-sm shadow-slate-200/50 ring-1 ring-slate-900/5"
              : "text-slate-500 hover:text-slate-700"
              }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form className="space-y-6">
        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            {/* Subject Dropdown */}
            <Dropdown
              label="Subject"
              options={subjects}
              selectedId={selectedSubjectId}
              onChange={(id) => {
                const fakeEvent = {
                  target: { value: id },
                } as React.ChangeEvent<HTMLSelectElement>;
                handleSubjectChange(fakeEvent);
              }}
              disabled={isLoadingSubjects}
              error={validationErrors.subject}
              placeholder="Choose Subject"
            />

            {/* Topic Dropdown */}
            <MultiSelectDropdown
              label="Topic"
              options={topics}
              selectedIds={selectedTopicIds}
              onChange={handleTopicIdsChange}
              disabled={!selectedSubjectId || isLoadingTopics}
              error={validationErrors.topic}
              placeholder="Choose Topics"
            />

            {/* Duration (Minutes) */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Duration (Minutes)
              </label>
              <input
                type="text"
                placeholder="Enter the time"
                value={duration}
                onChange={(e) => {
                  setDuration(e.target.value);
                  setValidationErrors((prev) => ({ ...prev, duration: "" }));
                }}
                className={`w-full text-sm px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#1f59da] placeholder-gray-300 ${validationErrors.duration
                  ? "border-red-500 bg-red-50/10"
                  : "border-gray-200"
                  }`}
              />
              {validationErrors.duration && (
                <p className="text-red-500 text-xs font-semibold mt-1">
                  {validationErrors.duration}
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* Name of Test Input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Name of Test
              </label>
              <input
                type="text"
                placeholder="Enter name of Test"
                value={nameOfTest}
                onChange={(e) => {
                  setNameOfTest(e.target.value);
                  setValidationErrors((prev) => ({ ...prev, name: "" }));
                }}
                className={`w-full text-sm px-4 py-3 rounded-xl border focus:outline-none focus:ring-1 focus:ring-[#1f59da] placeholder-gray-300 ${validationErrors.name
                  ? "border-red-500 bg-red-50/10"
                  : "border-gray-200"
                  }`}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-xs font-semibold mt-1">
                  {validationErrors.name}
                </p>
              )}
            </div>

            {/* Sub Topic Dropdown */}
            <MultiSelectDropdown
              label="Sub Topic"
              options={subTopics}
              selectedIds={selectedSubTopicIds}
              onChange={handleSubTopicIdsChange}
              disabled={selectedTopicIds.length === 0 || isLoadingSubTopics}
              error={validationErrors.subTopic}
              placeholder="Choose Sub Topics"
            />

            {/* Test Difficulty Level */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Test Difficulty Level
              </label>
              <div className="flex items-center gap-8 h-[36px] justify-between">
                {(["Easy", "Medium", "Difficult"] as const).map((level) => {
                  const isActive = difficulty === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setDifficulty(level)}
                      className="flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors select-none bg-transparent border-none p-0 focus:outline-none"
                    >
                      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${isActive ? "border-[#1f59da]" : "border-[#1f59da]/45 hover:border-[#1f59da]"
                        }`}>
                        {isActive && <span className="w-2.5 h-2.5 rounded-full bg-[#1f59da]" />}
                      </span>
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Marking Scheme Section */}
        <div className="mt-8">
          <div className="mb-6 flex items-center gap-3">
            <h3 className="text-sm font-bold text-slate-800 capitalize">Marking Scheme:</h3>
          </div>

          {/* Marking Scheme row: 5 columns */}
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 items-end">
            {/* Wrong Answer */}
            <div className="space-y-2 col-span-1 relative pb-3">
              <label className="block text-xs font-bold text-slate-500 capitalize tracking-wider">
                Wrong
              </label>
              <input
                type="number"
                value={wrongAnswer}
                onChange={(e) => setWrongAnswer(Number(e.target.value))}
                className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1f59da]/20 focus:border-[#1f59da] transition-all shadow-sm"
              />
            </div>

            {/* Unattempted */}
            <div className="space-y-2 col-span-1 relative pb-3">
              <label className="block text-xs font-bold text-slate-500 capitalize tracking-wider">
                Unattempt
              </label>
              <input
                type="number"
                value={unattempted}
                onChange={(e) => setUnattempted(Number(e.target.value))}
                className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1f59da]/20 focus:border-[#1f59da] transition-all shadow-sm"
              />
            </div>

            {/* Correct Answer */}
            <div className="space-y-2 col-span-1 relative pb-3">
              <label className="block text-xs font-bold text-slate-500 capitalize tracking-wider">
                Correct
              </label>
              <input
                type="number"
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(Number(e.target.value))}
                className="w-full h-[46px] px-4 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1f59da]/20 focus:border-[#1f59da] transition-all shadow-sm"
              />
            </div>

            {/* No of Questions */}
            <div className="space-y-2 col-span-1 relative pb-3">
              <label className="block text-xs font-bold text-slate-500 capitalize tracking-wider">
                Questions
              </label>
              <input
                type="text"
                placeholder="Ex:5"
                value={noOfQuestions}
                onChange={(e) => {
                  setNoOfQuestions(e.target.value);
                  setValidationErrors((prev) => ({ ...prev, noOfQuestions: "" }));
                }}
                className={`w-full text-sm font-semibold px-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#1f59da]/20 focus:border-[#1f59da] transition-all placeholder-slate-300 h-[46px] shadow-sm ${validationErrors.noOfQuestions
                  ? "border-red-500 bg-red-50/10"
                  : "border-slate-200"
                  }`}
              />
              {validationErrors.noOfQuestions && (
                <p className="text-red-500 text-[10px] font-semibold absolute bottom-[-8px] left-0 w-full truncate leading-none">
                  {validationErrors.noOfQuestions}
                </p>
              )}
            </div>

            {/* Total Marks (auto-calculated) */}
            <div className="space-y-2 col-span-1 relative pb-3">
              <label className="block text-xs font-bold capitalize tracking-wider">
                Total Marks
              </label>
              <input
                type="text"
                placeholder="0"
                value={totalMarks}
                readOnly
                className={`w-full text-sm font-bold px-4 rounded-xl border h-[46px] border-gray-100 cursor-not-allowed select-none shadow-inner ${validationErrors.totalMarks
                  ? "border-red-500 bg-red-50/10 text-red-500"
                  : ""
                  }`}
              />
              {validationErrors.totalMarks && (
                <p className="text-red-500 text-[10px] font-semibold absolute bottom-[-8px] left-0 w-full truncate leading-none">
                  {validationErrors.totalMarks}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-brand-blue-hover text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmitForm(e, true)}
            disabled={
              testId
                ? updateTestMutation.isPending
                : createTestMutation.isPending
            }
            className="px-8 py-3 bg-brand-blue hover:bg-brand-blue-hover text-white text-sm font-semibold rounded-xl cursor-pointer transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {testId ? (
              updateTestMutation.isPending ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Saving...
                </>
              ) : (
                "Next"
              )
            ) : createTestMutation.isPending ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating...
              </>
            ) : (
              "Next"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TestCreationForm;
