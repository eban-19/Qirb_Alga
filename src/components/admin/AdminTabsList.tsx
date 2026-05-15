import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PensionOwner, AdminBooking, SystemAlert } from "@/types/admin";

interface AdminTabsListProps {
  owners: PensionOwner[];
  pensions: any[];
  bookings: AdminBooking[];
  alerts: SystemAlert[];
}

export const AdminTabsList = ({ owners, pensions, bookings, alerts }: AdminTabsListProps) => {
  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-blue-100 to-indigo-100 rounded-2xl opacity-50"></div>
      <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-4 md:p-6 border-2 border-white/50 shadow-xl max-w-full overflow-x-hidden">
        <TabsList className="flex flex-wrap items-center justify-start gap-2 bg-transparent border-0 p-2 md:justify-center md:gap-4 md:p-0">

          <TabsTrigger
            value="overview"
            className="group relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-slate-900 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 text-slate-700 hover:text-slate-900 font-bold px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-slate-300 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold">Overview</span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="owners"
            className="group relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-slate-900 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 text-slate-700 hover:text-slate-900 font-bold px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-slate-300 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold">Owners</span>
              <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                {owners.filter(o => o.status === 'pending' || o.documentStatus === 'pending').length}
              </div>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="properties"
            className="group relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-slate-900 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 text-slate-700 hover:text-slate-900 font-bold px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-slate-300 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold">Properties</span>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="pension-approval"
            className="group relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-slate-900 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 text-slate-700 hover:text-slate-900 font-bold px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-slate-300 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold">Pension Approvals</span>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                {pensions.filter(p => p.status === 'pending').length}
              </div>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="bookings"
            className="group relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-slate-900 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 text-slate-700 hover:text-slate-900 font-bold px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-slate-300 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold">Bookings</span>
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                {bookings.filter(b => b.status === 'pending').length}
              </div>
            </span>
          </TabsTrigger>

          <TabsTrigger
            value="alerts"
            className="group relative overflow-hidden data-[state=active]:bg-gradient-to-r data-[state=active]:from-slate-700 data-[state=active]:via-slate-800 data-[state=active]:to-slate-900 data-[state=active]:text-white data-[state=active]:border-2 data-[state=active]:border-slate-900 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-300 hover:from-slate-200 hover:via-slate-300 hover:to-slate-400 text-slate-700 hover:text-slate-900 font-bold px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 border-2 border-slate-300 rounded-xl before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/30 before:via-transparent before:to-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-3">
              <div className="w-5 h-5 group-hover:rotate-180 transition-transform duration-300">
                <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 rounded-lg group-hover:from-slate-700 group-hover:to-slate-900 transition-all duration-300 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <span className="font-bold">Alerts</span>
              <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-black px-2 py-1 rounded-full group-hover:scale-110 transition-transform duration-300 shadow-md">
                {alerts.filter(a => a.status === 'open').length}
              </div>
            </span>
          </TabsTrigger>

        </TabsList>
      </div>
    </div>
  );
};
