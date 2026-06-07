
"use client";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import { authApi } from "@/app/api/auth";
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  Briefcase,
  ChevronLeft,
  KeyRound,
  History,
  BarChart3,
  LogOut,
  ChevronDown,
  Activity,
} from "lucide-react";
import Link from "next/link";

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const router = useRouter();

  // ✅ Fixed: added leading slash for skill-gap
  const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
   { icon: FileText, label: "Resume Builder", href: "/resume-builder" },
    { icon: Target, label: "Skill Gap Analysis", href: "/skill-gap" },
    { icon: Map, label: "Roadmap Generator", href: "/roadmap" },
    { icon: Briefcase, label: "Job Recommendation", href: "/job-recommendation?from=dashboard" },
  ];

  const [isActivityOpen, setIsActivityOpen] = React.useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";


async function handleLogout() {
  if (isLoggingOut) return;
  setIsLoggingOut(true);
  try {
    await authApi.logout();   // ✅ unified path + headers
  } catch (e) {
    console.error("Logout API failed:", e);
  } finally {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("session_id");
      
    } catch {}
    router.push("/home"); // or "/auth"
    setIsLoggingOut(false);
  }
}

  return (
    <div className="relative h-screen z-50">
      <aside
        className={`bg-[#dff7ee] text-[#1A184D] flex flex-col h-screen transition-all duration-300 ease-in-out shadow-[1px_0_20px_rgba(0,0,0,0.02)] border-r border-[#1A184D]/5 ${
          isCollapsed ? "w-20" : "w-68"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 h-24 flex items-center gap-3 border-b border-[#1A184D]/5">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="shrink-0"
          >
            <img src="/images/logo.png" alt="Logo" className="w-10 h-10 object-contain" />
          </motion.div>
          {!isCollapsed && (
            <span className="font-black text-xl tracking-tight text-[#1A184D]">
              SkillmatriX
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-8 px-4 space-y-1">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-[#A8E6CF]/20 group"
              prefetch={false}
            >
              <item.icon
                size={20}
                className="text-[#1A184D] shrink-0 transition-all opacity-80 group-hover:opacity-100"
              />
              {!isCollapsed && (
                <span className="font-bold text-[#1A184D]/90 group-hover:text-[#1A184D] transition-colors text-sm">
                  {item.label}
                </span>
              )}
            </Link>
          ))}

          {/* History Dropdown */}
          {/* <div className="pt-2">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setIsHistoryOpen(true);
                } else {
                  setIsHistoryOpen(!isHistoryOpen);
                }
              }}
              className="w-full flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-[#A8E6CF]/20 group"
            >
              <History
                size={20}
                className="text-[#1A184D] shrink-0 transition-all opacity-80 group-hover:opacity-100"
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-bold text-[#1A184D]/90 group-hover:text-[#1A184D] transition-colors text-sm">
                    History
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isHistoryOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              )}
            </button>

            {isHistoryOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-9 mt-1 space-y-1"
              >
                <Link
                  href="#"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#A8E6CF]/30 group transition-all"
                >
                  <FileText
                    size={16}
                    className="text-[#1A184D]/70 group-hover:text-[#1A184D]"
                  />
                  <span className="text-xs font-semibold text-[#1A184D]/80 group-hover:text-[#1A184D]">
                    Resume History
                  </span>
                </Link>
                <Link
                  href="#"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#A8E6CF]/30 group transition-all"
                >
                  <BarChart3
                    size={16}
                    className="text-[#1A184D]/70 group-hover:text-[#1A184D]"
                  />
                  <span className="text-xs font-semibold text-[#1A184D]/80 group-hover:text-[#1A184D]">
                    Skill Gap History
                  </span>
                </Link>
              </motion.div>
            )}
          </div> */}

          {/* Activity / Security Dropdown */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                  setIsActivityOpen(true);
                } else {
                  setIsActivityOpen(!isActivityOpen);
                }
              }}
              className="w-full flex items-center gap-4 p-3 rounded-xl transition-all hover:bg-[#A8E6CF]/20 group"
            >
              <Activity
                size={20}
                className="text-[#1A184D] shrink-0 transition-all opacity-80 group-hover:opacity-100"
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between">
                  <span className="font-bold text-[#1A184D]/90 group-hover:text-[#1A184D] transition-colors text-sm">
                    Activity & Security
                  </span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-200 ${
                      isActivityOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              )}
            </button>

            {isActivityOpen && !isCollapsed && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="ml-9 mt-1 space-y-1"
              >
                

                {/* ✅ Separate Activity page link (if you have it) */}
                <Link
                  href="/activity"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#A8E6CF]/30 group transition-all"
                  prefetch={false}
                >
                  <Activity
                    size={16}
                    className="text-[#1A184D]/70 group-hover:text-[#1A184D]"
                  />
                  <span className="text-xs font-semibold text-[#1A184D]/80 group-hover:text-[#1A184D]">
                    Activity Logs
                  </span>
                </Link>

                {/* ✅ Reliable Logout button */}
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 group"
                  aria-label="Logout"
                >
                  <LogOut
                    size={16}
                    className={`${
                      isLoggingOut ? "text-rose-300" : "text-rose-500 group-hover:text-rose-600"
                    }`}
                  />
                  <span
                    className={`text-xs font-semibold ${
                      isLoggingOut ? "text-rose-300" : "text-rose-500 group-hover:text-rose-600"
                    }`}
                  >
                    {isLoggingOut ? "Logging out…" : "Logout"}
                  </span>
                </button>
              </motion.div>
            )}
          </div>
        </nav>
      </aside>

      {/* Repositioned Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-[#1A184D]/10 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all hover:scale-110 z-[60] group"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        <ChevronLeft
          size={14}
          className={`text-[#1A184D] transition-transform duration-300 ${
            isCollapsed ? "rotate-180" : ""
          }`}
        />
      </button>
    </div>
  );
};

export default Sidebar;
