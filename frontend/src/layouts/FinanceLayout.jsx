import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/ui/Header";
import Sidebar from "../components/ui/Sidebar";

export default function FinanceLayout() {
  // Demo user/tenant info; replace with real context later
  const user = { name: "Demo Admin" };
  const tenant = { name: "SSK Finance" };
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header user={user} tenant={tenant} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 h-[calc(100vh-64px)]">
        {/* Sidebar (fixed) */}
        <div className={`fixed top-0 left-0 bottom-0 z-30 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`} style={{ paddingTop: '64px' }}>
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </div>
        
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20  bg-opacity-10 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        
        {/* Main Content (scrollable) */}
        <main className="flex-1 ml-0 md:ml-64 overflow-y-auto bg-gray-50 w-full">
          <div className="w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
