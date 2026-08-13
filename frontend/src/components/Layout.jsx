import { useState } from 'react';
import Navbar from './Navbar.jsx';

export default function Layout({ children }) {
  // Desktop starts open.
  // Mobile starts closed.
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    if (typeof window === 'undefined') {
      return true;
    }

    return window.innerWidth >= 1024;
  });

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      <Navbar
        sidebarOpen={sidebarOpen}
        onMenuClick={toggleSidebar}
        onCloseSidebar={closeSidebar}
      />

      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={closeSidebar}
          className="fixed inset-0 top-16 z-20 bg-slate-950/40 lg:hidden"
        />
      )}

      {/* Main content */}
      <main
        className={`min-h-screen pt-16 transition-all duration-200 ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}