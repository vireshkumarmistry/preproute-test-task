import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Eye,
  Trash2,
  AlertCircle,
  X,
  Award,
  Pen,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
} from "lucide-react";

import Dropdown from "../../components/Dropdown";

import type { Test } from "../../types/tests";

import {
  getDifficultyColor,
  formatType,
  getStatusStyle,
} from "../../utils/helper";

interface TestListProps {
  tests: Test[];
  onDelete: (id: string) => void;
  onEditStart: (id: string) => void;
  onCreateNew: () => void;
}

const TestList = ({
  tests,
  onDelete,
  onEditStart,
  onCreateNew,
}: TestListProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [statusFilter, setStatusFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");
  const [subjectFilter, setSubjectFilter] = useState("All");

  // Modal states
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testToDelete, setTestToDelete] = useState<Test | null>(null);

  // Search and filter
  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test?.subject?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "All" || test.status === statusFilter;
    const matchesDifficulty = difficultyFilter === "All" || (test.difficulty || "Easy").toLowerCase() === difficultyFilter.toLowerCase();
    const matchesSubject = subjectFilter === "All" || test.subject === subjectFilter;

    return matchesSearch && matchesStatus && matchesDifficulty && matchesSubject;
  });

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredTests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredTests.length);
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

  // Fallback in case current page goes out of bounds (e.g. after deletion or search changes)
  if (currentPage > 1 && currentPage > totalPages) {
    setCurrentPage(Math.max(1, totalPages));
  }

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(
          1,
          "...",
          totalPages - 3,
          totalPages - 2,
          totalPages - 1,
          totalPages,
        );
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages,
        );
      }
    }
    return pages;
  };

  // Delete handler
  const handleDeleteTest = (test: Test) => {
    setTestToDelete(test);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (testToDelete) {
      onDelete(testToDelete.id);
      setIsDeleteModalOpen(false);
      setTestToDelete(null);
    }
  };

  // Open View Modal
  const openViewModal = (test: Test) => {
    navigate(`/tests/view/${test.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 md:p-8 rounded-3xl shadow-xs relative overflow-hidden">
        {/* Decorative background shape */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-[#1f59da]/5 to-[#1f59da]/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Test Library</h1>
          <p className="text-sm text-slate-500 font-medium mt-1.5">
            Create, manage, and seamlessly track your exam papers
          </p>
        </div>
        <button
          onClick={onCreateNew}
          className="group relative z-10 flex items-center justify-center gap-2.5 rounded-xl bg-[#1f59da] px-6 py-3.5 text-sm font-bold text-white shadow-md shadow-[#1f59da]/30 hover:bg-[#1546be] hover:shadow-lg hover:-translate-y-0.5 transition-all cursor-pointer w-full sm:w-auto"
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
          Create New Test
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 md:p-4 rounded-2xl shadow-xs flex flex-col xl:flex-row justify-between items-stretch xl:items-center gap-4">
        {/* Search */}
        <div className="flex flex-1 items-center bg-slate-50 px-4 py-3 rounded-xl focus-within:ring-2 focus-within:ring-[#1f59da]/20 transition-all w-full xl:max-w-md">
          <Search className="h-5 w-5 text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Search by test name or subject..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full text-sm font-semibold text-slate-700 bg-transparent placeholder-slate-400 focus:outline-none"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full xl:w-auto">
          <Dropdown
            label="Status"
            selectedId={statusFilter}
            options={["All", "Active", "Draft", "Completed", "Live"].map((opt) => ({
              id: opt,
              name: opt,
            }))}
            onChange={(val) => {
              setStatusFilter(val);
              setCurrentPage(1);
            }}
            variant="borderless"
            showLabelInline
            className="flex-1 sm:flex-initial min-w-[200px] sm:min-w-[200px]"
          />

          <Dropdown
            label="Level"
            selectedId={difficultyFilter}
            options={["All", "Easy", "Medium", "Hard"].map((opt) => ({
              id: opt,
              name: opt,
            }))}
            onChange={(val) => {
              setDifficultyFilter(val);
              setCurrentPage(1);
            }}
            variant="borderless"
            showLabelInline
            className="flex-1 sm:flex-initial min-w-[200px] sm:min-w-[200px]"
          />

          <Dropdown
            label="Subject"
            selectedId={subjectFilter}
            options={["All", ...Array.from(new Set(tests.map((t) => t.subject).filter(Boolean)))].map((opt) => ({
              id: opt,
              name: opt,
            }))}
            onChange={(val) => {
              setSubjectFilter(val);
              setCurrentPage(1);
            }}
            variant="borderless"
            showLabelInline
            className="flex-1 sm:flex-initial min-w-[200px] sm:min-w-[200px]"
          />
        </div>
      </div>

      {/* Cards Layout */}
      {filteredTests.length === 0 ? (
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-300 py-16 px-4 text-center">
          <AlertCircle className="h-12 w-12 text-gray-300 mb-3" />
          <h3 className="text-lg font-semibold text-gray-700">
            No tests found
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            Try resetting your search query or create a new test
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTests.map((test) => (
              <div
                key={test.id}
                className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/60 hover:border-slate-300/85 shadow-xs hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Top Accent Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1f59da] to-[#60a5fa] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="p-5 flex-1 flex flex-col">
                  {/* Category Pill, Status Badge and Actions */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                        {formatType(test.type)}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border shadow-2xs ${getStatusStyle(test.status)}`}
                      >
                        {test.status === "Active" && (
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                        )}
                        {test.status === "Active" ? "Live" : test.status}
                      </span>
                    </div>

                    {/* Action Buttons visible on hover */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 -mr-1 -mt-1">
                      <button
                        onClick={() => openViewModal(test)}
                        className="p-1.5 text-slate-400 hover:text-[#1f59da] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onEditStart(test.id)}
                        className="p-1.5 text-slate-400 hover:text-[#1f59da] hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit Test"
                      >
                        <Pen className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTest(test)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Test"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Title and Level */}
                  <div className="mb-5 flex-1">
                    <h3 className="text-[17px] font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-[#1f59da] transition-colors mb-2.5">
                      {test.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className={`${getDifficultyColor(test.difficulty)} text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1.5 capitalize`}
                      >
                        <Award className="h-3 w-3" />
                        {test.difficulty || "Easy"}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          {test.duration || 60}m
                        </span>
                        <span className="flex items-center gap-1.5">
                          <FileText className="h-3.5 w-3.5 text-slate-400" />
                          {test.questionsCount || 25} Qs
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Details Section in a neat card-within-card */}
                  <div className="bg-slate-50/80 rounded-xl p-4">
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                          Subject
                        </p>
                        <p className="text-sm font-semibold text-slate-700 truncate">
                          {test.subject}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1">
                          Created
                        </p>
                        <p className="text-sm font-semibold text-slate-700">
                          {test.createdDate}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-1.5">
                        Topics
                      </p>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {test.topics && test.topics.length > 0 ? (
                          test.topics.map((t) => (
                            <span
                              key={t}
                              className="bg-white text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-2xs"
                            >
                              {t}
                            </span>
                          ))
                        ) : (
                          <span className="bg-white text-slate-600 border border-slate-200 px-2.5 py-0.5 rounded-md text-[11px] font-semibold shadow-2xs">
                            {test.subject === "Chemistry"
                              ? "Organic"
                              : test.subject === "Physics"
                                ? "Mechanics"
                                : "Grammar"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {filteredTests.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white px-6 py-4.5 rounded-3xl shadow-xs mt-8 transition-all">
              {/* Items per page selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Show</span>
                <div className="relative">
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="appearance-none text-xs font-bold text-slate-700 bg-slate-50 rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-[#1f59da]/10 cursor-pointer shadow-2xs transition-all"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                  per page
                </span>
              </div>

              {/* Info */}
              <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                Showing{" "}
                <span className="text-[#1f59da] font-black">
                  {startIndex + 1}
                </span>{" "}
                to{" "}
                <span className="text-[#1f59da] font-black">{endIndex}</span>{" "}
                of{" "}
                <span className="text-slate-700 font-black">
                  {filteredTests.length}
                </span>{" "}
                records
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-600 transition-all disabled:opacity-40 disabled:hover:bg-slate-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <div className="hidden md:flex items-center gap-1.5">
                  {getPageNumbers().map((page, idx) => {
                    if (page === "...") {
                      return (
                        <span
                          key={`ellipsis-${idx}`}
                          className="w-8 h-8 flex items-center justify-center text-xs font-bold text-slate-400"
                        >
                          ...
                        </span>
                      );
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(Number(page))}
                        className={`w-8 h-8 flex items-center justify-center rounded-xl text-xs font-bold transition-all active:scale-95 ${currentPage === page
                            ? "bg-[#1f59da] text-white shadow-md shadow-[#1f59da]/20 cursor-default"
                            : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-extrabold text-slate-600 transition-all disabled:opacity-40 disabled:hover:bg-slate-50 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
      {isDeleteModalOpen && testToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Trash2 className="h-5 w-5 text-red-500" />
                Delete Test
              </h3>
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTestToDelete(null);
                }}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <p className="text-sm text-gray-600">
                Are you sure you want to delete the test{" "}
                <span className="font-semibold text-gray-900">
                  "{testToDelete.name}"
                </span>
                ?
              </p>
              <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-xs text-red-700">
                  This action is permanent and cannot be undone. This will
                  delete all questions and history associated with this test.
                </p>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setTestToDelete(null);
                }}
                className="px-4 py-2 bg-white border border-[#d9e5f7] hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg cursor-pointer transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestList;
