
"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, LogIn, LogOut, ExternalLink } from "lucide-react";
import Link from "next/link";

/** Map any backend activity shape -> UI shape (login/logout + meta) */
function normalizeActivity(item) {
  if (!item || typeof item !== "object") return null;

  // A) { title, time, station, sessionActive, type, riskScore, sessionId }
  // B) { eventType, createdAt, device, status, ... }

  const title =
    item.title ??
    ((item.eventType || "").toUpperCase() === "LOGIN"
      ? "Login"
      : (item.eventType || "").toUpperCase().startsWith("LOGOUT")
      ? "Logout"
      : "Activity");

  const when = item.time || item.createdAt || item.timestamp || null;
  const d = when ? new Date(when) : new Date(); // fallback to now (client-only compute)

  const station = item.station ?? item.device ?? "Station 01";

  const isLogin = (title || "").toLowerCase().includes("login");

  const sessionActive =
    typeof item.sessionActive === "boolean"
      ? item.sessionActive
      : item.status === "SUCCESS";

  return {
    type: isLogin ? "login" : "logout",
    title,
    dateText: d.toLocaleDateString(),
    timeText: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    station,
    sessionActive,
  };
}

export default function ActivitySection({ items }) {
  // 🔒 No state updates/effects needed. Memoize derived list.
  const activities = useMemo(() => {
    const list = Array.isArray(items) ? items : [];
    return list.slice(0, 3).map(normalizeActivity).filter(Boolean);
  }, [items]);

  return (
    <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-[#1A184D] tracking-tight">My Activity</h2>
          <p className="text-[#1A184D]/60 text-sm font-medium mt-1">Recent session history</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/activity">
            <button className="flex items-center gap-2 bg-[#A8E6CF]/40 hover:bg-[#A8E6CF]/60 px-5 py-2.5 rounded-2xl transition-all group border border-white/20">
              <span className="text-[#1A184D] text-xs font-bold uppercase tracking-wider">View All</span>
              <ExternalLink
                size={14}
                className="text-[#1A184D]/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
              />
            </button>
          </Link>

        
        </div>
      </div>

      <div className="space-y-4">
        {activities.length === 0 && (
          <div className="text-sm text-[#1A184D]/50">No recent activity to show.</div>
        )}

        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-4 rounded-2xl bg-white/50 hover:bg-white/80 transition-all group border border-transparent hover:border-[#A8E6CF]/30 hover:shadow-lg hover:shadow-[#A8E6CF]/10"
          >
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${
                  activity.type === "login" ? "bg-[#A8E6CF]/20 text-emerald-600" : "bg-rose-50 text-rose-500"
                }`}
              >
                {activity.type === "login" ? <LogIn size={20} /> : <LogOut size={20} />}
              </div>
              <div>
                <span
                  className={`text-sm font-bold ${
                    activity.type === "login" ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {activity.title}
                </span>

                <div className="flex items-center gap-3 mt-1">
                  <div className="flex items-center gap-1.5 text-[#1A184D]/40">
                    <Calendar size={12} />
                    <span className="text-xs font-medium">{activity.dateText}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#1A184D]/40">
                    <Clock size={12} />
                    <span className="text-xs font-medium">{activity.timeText}</span>
                  </div>
                </div>

                <span className="text-[10px] text-[#1A184D]/30 font-bold">{activity.station}</span>
              </div>
            </div>

            {!activity.sessionActive && (
              <span className="text-[10px] text-rose-500 font-bold">INACTIVE</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
``
