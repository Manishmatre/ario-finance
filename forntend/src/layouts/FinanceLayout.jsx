import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";

export default function FinanceLayout() {
  // Demo user/tenant info; replace with real context later
  const user = { name: "Demo Admin" };
  const tenant = { name: "Ario Finance" };
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header user={user} tenant={tenant} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black bg-opacity-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        {/* Main Content */}
        <main className="flex-1 p-6 md:ml-0 overflow-y-auto bg-white rounded-tl-xl shadow">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
