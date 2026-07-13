
import MainLayout from "../components/MainLayout";
import { ClipboardCheck } from "lucide-react";

const TestTrackingPage = () => {
  return (
    <MainLayout>
      <div className="bg-white p-8 rounded-2xl border border-[#d9e5f7] shadow-xs max-w-7xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#f0f4fe] rounded-xl text-[#1f59da]">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Test Tracking</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Monitor tests and exam completions
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500">
          Live monitoring systems are operational. Select a test from the
          dashboard to track detailed performance statistics.
        </p>
      </div>
    </MainLayout>
  );
};

export default TestTrackingPage;
