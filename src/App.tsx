/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppProvider, useAppContext } from "./store/AppContext";
import { cn } from "./lib/utils";
import {
  LayoutDashboard,
  RefreshCcw,
  Wallet,
  FileText,
  Users,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  TrendingUp,
} from "lucide-react";
import React, { useState } from "react";

// Pages
import Dashboard from "./pages/Dashboard";
import Cycles from "./pages/Cycles";
import Ledger from "./pages/Ledger";
import SettingsPage from "./pages/SettingsPage";
import Proposal from "./pages/Proposal";
import AdminFinances from "./pages/AdminFinances";
// import Investors from './pages/Investors';

function Sidebar({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) {
  const { role, setRole, notifications } = useAppContext();
  const location = useLocation();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const links = [
    { name: "Overview / Pitch", path: "/proposal", icon: FileText },
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    ...(role === "admin" ? [
      { name: "Funding / Investment", path: "/cycles", icon: RefreshCcw },
      { name: "Corporate Finances", path: "/corporate-finances", icon: TrendingUp }
    ] : []),
    { name: "Ledger", path: "/ledger", icon: Wallet },
    ...(role === "admin"
      ? [{ name: "Settings", path: "/settings", icon: Settings }]
      : []),
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-natural-900/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed md:static inset-y-0 left-0 w-72 md:w-64 bg-natural-200 border-r border-natural-400 text-natural-800 flex flex-col min-h-screen z-50 transform transition-transform duration-300",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 md:p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">R</div>
            <span className="text-xl md:text-2xl font-serif font-bold tracking-tight text-natural-900">RecycleFlow</span>
          </div>
          <button className="md:hidden p-2 text-natural-700 hover:bg-natural-300 rounded-lg" onClick={() => setIsOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="space-y-1.5 px-4 md:px-6">
          {links.map((link) => {
            const active = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all",
                  active
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "text-natural-700 hover:bg-natural-300/80 hover:text-natural-900",
                )}
              >
                <Icon className={cn("w-5 h-5", active ? "text-natural-100" : "text-natural-600")} />
                {link.name}
                {link.name === "Settings" &&
                  unreadCount > 0 &&
                  role === "investor" && (
                    <span className="ml-auto w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] text-white font-bold">
                      {unreadCount}
                    </span>
                  )}
              </Link>
            );
          })}
        </nav>
      
        <div className="mt-auto p-4 md:p-6 pb-8 md:pb-6 border-t border-natural-400">
          <div className="flex flex-col gap-2 p-1">
            <label className="text-[10px] font-bold text-natural-600 uppercase tracking-widest px-1">View Mode</label>
            <div className="relative">
              <select
                value={role}
                onChange={(e) => {
                  setRole(e.target.value as "admin" | "investor");
                  if (setIsOpen) setIsOpen(false);
                }}
                className="w-full appearance-none bg-white border border-natural-300 text-natural-900 text-sm font-bold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary block p-3 shadow-sm cursor-pointer"
              >
                <option value="admin">Admin Dashboard</option>
                <option value="investor">Investor View</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-natural-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Topbar({ setIsOpen }: { setIsOpen: (val: boolean) => void }) {
  const { role, notifications, markNotificationsAsRead } = useAppContext();
  const [showNotifs, setShowNotifs] = React.useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-[72px] px-4 md:px-8 flex items-center justify-between border-b border-natural-400 bg-natural-50 shadow-sm md:shadow-none z-30 sticky top-0 md:static">
      <div className="flex items-center gap-3">
        <button 
          onClick={() => setIsOpen(true)}
          className="md:hidden p-2 text-natural-700 hover:bg-natural-300 rounded-lg"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg md:text-xl font-serif italic text-natural-900 capitalize truncate max-w-[200px] md:max-w-none">
          Investor Transparency Board
        </h2>
      </div>

      <div className="flex justify-end gap-3 md:gap-4 items-center">
        <span className="hidden md:inline-block px-3 py-1 bg-natural-400 text-primary text-[10px] md:text-xs font-bold rounded-full uppercase tracking-widest border border-natural-500/50 shadow-sm">Active Cycle</span>
      <div className="relative">
        <button
          onClick={() => {
            setShowNotifs(!showNotifs);
            if (showNotifs) markNotificationsAsRead();
          }}
          className="p-2 md:p-2.5 text-natural-700 hover:bg-natural-300 rounded-full relative transition-colors border border-transparent hover:border-natural-400 hover:shadow-sm"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_#F7F8F3]" />
          )}
        </button>

        {showNotifs && (
          <div className="absolute right-0 mt-2 w-[calc(100vw-32px)] md:w-80 max-w-[320px] bg-white border border-natural-400 shadow-xl rounded-2xl overflow-hidden z-50 transform translate-x-4 md:translate-x-0">
            <div className="p-4 bg-natural-50 border-b border-natural-300 font-bold text-xs md:text-sm text-primary tracking-widest uppercase flex justify-between items-center">
              Notifications
            </div>
            <div className="max-h-64 overflow-y-auto overscroll-contain">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-sm font-bold text-natural-600 bg-natural-50/50">
                  No notifications
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-4 border-b border-natural-100 text-sm transition-colors cursor-default",
                      n.read
                        ? "bg-white text-natural-700 hover:bg-natural-50"
                        : "bg-primary/5 text-natural-900 font-bold",
                    )}
                  >
                    <p className="leading-relaxed">{n.message}</p>
                    <p className="text-[10px] md:text-xs text-natural-500 font-bold uppercase tracking-widest mt-2">
                      {new Date(n.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </header>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-[100dvh] bg-natural-50 text-natural-800 font-sans overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Topbar setIsOpen={setSidebarOpen} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-20 md:pb-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/proposal" element={<Proposal />} />
            <Route path="/cycles/*" element={<Cycles />} />
            <Route path="/ledger" element={<Ledger />} />
            <Route path="/corporate-finances" element={<AdminFinances />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </AppProvider>
  );
}
