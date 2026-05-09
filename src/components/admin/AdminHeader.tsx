import { Shield } from "lucide-react";

export const AdminHeader = () => {
  return (
    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-4 md:p-6 shadow-xl fixed top-0 left-0 right-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Shield className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-lg md:text-2xl font-bold">Pension Platform Admin</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
