
"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, LogIn, LogOut, ArrowLeft } from "lucide-react";
import { normalizeActivity } from "@/lib/activity-normalize";

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    (async () => {
      try {
        const url = `${API_BASE}/activity/me/minimal?limit=100`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          credentials: "omit",
        });

        // Debug: check wrong content-type (HTML means wrong host/route)
        const ctype = res.headers.get("content-type") || "";
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          console.error("Activity fetch failed:", res.status, ctype, text.slice(0, 200));
          throw new Error(text || "Failed to load activity");
        }
        if (!ctype.includes("application/json")) {
          const text = await res.text().catch(() => "");
          console.error("Non-JSON received:", ctype, text.slice(0, 200));
          throw new Error("Unexpected response type");
        }

        const data = await res.json();
        const arr = Array.isArray(data) ? data : [];
        const mapped = arr.map(normalizeActivity);
        setActivities(mapped);
      } catch (err) {
        setError(err.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    })();
  }, [API_BASE]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#A8E6CF]">
        <span className="text-[#1A184D]/60 font-semibold">Loading activity history…</span>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#A8E6CF]">
        <span className="text-rose-600 font-semibold">{error}</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#A8E6CF] overflow-y-auto px-10 py-12">
      {/* Back */}
      <button
        onClick={() => window.history.back()}
        className="inline-flex items-center gap-2 text-[#1A184D]/60 hover:text-[#1A184D] transition-colors font-black text-xs tracking-widest uppercase mb-12 group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </button>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-[#1A184D] tracking-tighter">Full Activity History</h1>
          <p className="text-[#1A184D]/60 font-medium text-lg mt-2">Detailed log of all your sessions and actions</p>
        </div>

        {/* Activity List */}
        <div className="bg-white/40 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
          <div className="space-y-4">
            {activities.length === 0 && (
              <div className="text-sm text-[#1A184D]/50">No activity found.</div>
            )}

            {activities.map((a, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-white/50 hover:bg-white/80 transition-all group border border-transparent hover:border-[#A8E6CF]/30 hover:shadow-md"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-xl ${a.type === "login" ? "bg-[#A8E6CF]/20 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                    {a.type === "login" ? <LogIn size={18} /> : <LogOut size={18} />}
                  </div>

                  <div>
                    <span className={`text-sm font-bold ${a.type === "login" ? "text-emerald-700" : "text-rose-600"}`}>
                      {a.title}
                    </span>

                    <div className="flex items-center gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-[#1A184D]/60 text-xs">
                        <Calendar size={12} />
                        <span className="font-semibold">{a.dateText}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#1A184D]/60 text-xs">
                        <Clock size={12} />
                        <span className="font-semibold">{a.timeText}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full bg-[#1A184D]/5 text-[#1A184D]/40 text-[9px] font-black uppercase tracking-widest">
                    {a.station}
                  </span>
                  {!a.sessionActive && (
                    <span className="text-[9px] font-bold uppercase tracking-tighter text-rose-500">
                      INACTIVE
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
