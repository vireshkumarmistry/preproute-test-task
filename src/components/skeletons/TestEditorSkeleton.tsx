

export const TestEditorSkeleton = () => {
  return (
    <div className="flex h-[calc(100vh-60px)] w-full overflow-hidden bg-white -m-6 md:-m-8 animate-pulse">
      {/* Secondary Sidebar Skeleton */}
      <div className="w-[220px] shrink-0 border-r border-[#d9e5f7] bg-white flex flex-col h-full p-4 space-y-4">
        <div className="h-6 w-32 bg-gray-200 rounded"></div>
        <div className="h-8 w-full bg-gray-200 rounded-lg"></div>
        <div className="flex-1 space-y-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-9 w-full bg-gray-100 rounded-lg"
            ></div>
          ))}
        </div>
      </div>
      {/* Main Area Skeleton */}
      <div className="flex-1 flex flex-col h-full bg-[#f8faff] overflow-hidden">
        <div className="flex items-center justify-between px-6 md:px-8 py-4 border-b border-[#f4f6fc] bg-white shrink-0">
          <div className="h-5 w-48 bg-gray-200 rounded"></div>
          <div className="h-9 w-24 bg-gray-200 rounded-lg"></div>
        </div>
        <div className="w-full space-y-6 flex-1 p-6 md:p-8">
          {/* Summary card skeleton */}
          <div className="bg-white p-5 rounded-2xl border border-[#d9e5f7] space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
          </div>
          {/* Editor skeleton */}
          <div className="bg-white p-6 rounded-2xl border border-[#d9e5f7] space-y-4">
            <div className="h-4 w-24 bg-gray-200 rounded"></div>
            <div className="h-32 w-full bg-gray-100 rounded-xl"></div>
            <div className="h-4 w-32 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
              <div className="h-10 bg-gray-100 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
