

export const TestListSkeleton = () => {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Top Banner / Actions Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-[#d9e5f7] shadow-xs">
        <div className="space-y-2">
          <div className="h-6 w-48 bg-gray-200 rounded-lg"></div>
          <div className="h-4 w-64 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="h-10 w-40 bg-gray-200 rounded-xl"></div>
      </div>

      {/* Search bar skeleton */}
      <div className="h-12 w-1/2"></div>

      {/* Grid of Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="relative flex flex-col bg-white rounded-2xl border border-[#d9e5f7] p-5 space-y-4"
          >
            {/* Top Pill / Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-24 bg-gray-200 rounded-md"></div>
                <div className="h-5 w-16 bg-gray-200 rounded-full"></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 bg-gray-200 rounded-lg"></div>
                <div className="h-7 w-7 bg-gray-200 rounded-lg"></div>
                <div className="h-7 w-7 bg-gray-200 rounded-lg"></div>
              </div>
            </div>

            {/* Title */}
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 bg-gray-200 rounded-md"></div>
              <div className="h-5 w-40 bg-gray-200 rounded-lg"></div>
              <div className="h-5 w-16 bg-gray-200 rounded-lg"></div>
            </div>

            {/* Details layout with gray labels and colon alignment */}
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center">
                  <div className="w-16 h-3.5 bg-gray-200 rounded"></div>
                  <span className="text-gray-300 mx-2">:</span>
                  <div className="h-3.5 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
