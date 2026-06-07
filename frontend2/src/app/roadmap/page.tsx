/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck

"use client";
import React, { useState, useEffect } from "react";
// import Navbar from "@/components/roadmap/common/Navbar";
// import Footer from "@/components/roadmap/common/Footer";
import RoadmapDisplay from "@/components/roadmap/roadmap/RoadmapDisplay";
import {RoadmapNode, RoadmapLatestResponse} from "@/features/roadmap/type/type";
import { Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { GlassProfileBadgeAuto, UnderHeaderGlassStripAuto  } from "@/features/ProfileBadge";

// import Link from "next/link";
import { motion } from "framer-motion";

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:8080";

function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("accessToken") ?? "";
  const token = raw.replace(/^"|"$/g, "").trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}


export default function RoadmapPage() {

  const [roadmapData, setRoadmapData] = useState<RoadmapNode[] | null>(null);  
  const [role, setRole] = useState<string>("");
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);


useEffect(() => {
  console.log("SESSION ROLE:", sessionStorage.getItem("last-roadmap-role"));
  console.log("SESSION ROADMAP:", sessionStorage.getItem("last-roadmap"));
}, []);


useEffect(() => {
  const cachedRole = sessionStorage.getItem("last-roadmap-role");
  if (cachedRole) {
    setRole(cachedRole);
  }
}, []);

// useEffect(() => {
//   // if (!role) return; // ⛔ jab tak role na ho

//   (async () => {
//     try {
//       setLoading(true);
//       setError(null);

//       // 1️⃣ session roadmap
//       const cached = sessionStorage.getItem("last-roadmap");
//       if (cached) {
//         setRoadmapData(JSON.parse(cached));
//         return;
//       }

//       // 2️⃣ backend fallback
      
// const username =
//   sessionStorage.getItem("last-roadmap-username") ||
//   localStorage.getItem("username") ||
//   "";

//       const res = await fetch(
//         `${API_BASE}/api/roadmap/latest?username=${username}&role=${encodeURIComponent(role)}`,
        
//           {
//               headers: authHeader(),   // ✅ THIS LINE FIXES 401
//             }

//       );

//       const data: RoadmapLatestResponse = await res.json();

//       if (!res.ok) {
//         setError(data?.error || "No roadmap found.");
//         setRoadmapData(null);
//       } else {
//         setRoadmapData(data?.roadmap ?? data?.nodes ?? []);
//       }
//     } catch {
//       setError("Failed to fetch roadmap.");
//       setRoadmapData(null);
//     } finally {
//       setLoading(false);
//     }
//   })();
// }, [role]);

useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      setError(null);

      const cachedRole =
        sessionStorage.getItem("last-roadmap-role") ||
        "Full-Stack Developer";

      setRole(cachedRole);

      // 1️⃣ If cached roadmap exists
      const cached = sessionStorage.getItem("last-roadmap");
      if (cached) {
        setRoadmapData(JSON.parse(cached));
        return;
      }

      // 2️⃣ Try backend
      const username =
        sessionStorage.getItem("last-roadmap-username") ||
        localStorage.getItem("username") ||
        "Hafsa";

      const res = await fetch(
        `${API_BASE}/api/roadmap/latest?username=${username}&role=${encodeURIComponent(cachedRole)}`,
        {
          headers: authHeader(),
        }
      );

      if (res.ok) {
        const data = await res.json();
        setRoadmapData(data?.roadmap ?? data?.nodes ?? []);
      } else {
        throw new Error("Backend not available");
      }
    } catch (e) {
      console.log("Backend failed. Loading dummy roadmap...");
    } finally {
      setLoading(false);
    }
  })();
}, []);


  useEffect(() => {
  (async () => {
    try {
      setLoading(true);
      setError(null);

      //  1. Read role FIRST (single source of truth)
      const cachedRole = sessionStorage.getItem("last-roadmap-role") || "Full-Stack Developer";
      setRole(cachedRole);

      //  2. Read roadmap
      const cached = sessionStorage.getItem("last-roadmap");
      if (cached) {
        setRoadmapData(JSON.parse(cached));
        return;
      }

    
      
const username =
  sessionStorage.getItem("last-roadmap-username") ||
  localStorage.getItem("username") ||
  "Hafsa";

      const res = await fetch(
        `${API_BASE}/api/roadmap/latest?username=${username}&role=${encodeURIComponent(cachedRole)}`,
        {
              headers: authHeader(),   
            }

      );

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "No roadmap found.");
        setRoadmapData(null);
      } else {
        setRoadmapData(data?.roadmap ?? data?.nodes ?? []);
      }
    } catch (e) {
      setError("Failed to fetch roadmap.");
      setRoadmapData(null);
    } finally {
      setLoading(false);
    }
  })();
}, []);


  return (
    <div className="min-h-screen bg-[#a8e6cf]">
      {/* <div className="fixed top-0 left-0 w-full z-50"> */}
        {/* <Navbar showAuthButtons={true} isLoggedIn={false} /> */}
      {/* </div> */}

      <main className="pt-6 pb-20 relative overflow-x-visible overflow-y-visible">
        {/* Subtle Grainy Background Effect */}
        <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="mb-12 flex items-center justify-between">

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-[#3D418A]/60 hover:text-[#3D418A] transition-colors font-black text-xs tracking-widest uppercase mb-12 group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </button>
          <GlassProfileBadgeAuto
              align="right"
              showName={true}     // sirf photo chahiye to false
              tooltip="Signed in"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-[#3D418A] animate-spin" />
                <div className="absolute inset-0 blur-xl bg-white/30 animate-pulse" />
              </div>
              <p className="text-[#3D418A] font-black tracking-[0.3em] uppercase text-[10px] animate-pulse">
                Architecting Career Pathway...
              </p>
            </div>
          ) : error ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center py-40 text-center space-y-6"
            >
              <div className="w-20 h-20 rounded-3xl bg-white/50 backdrop-blur-xl flex items-center justify-center border border-white shadow-xl">
                <AlertCircle className="w-10 h-10 text-[#c86ad6]" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#3D418A]">No Roadmap Yet</h3>
                <p className="text-[#3D418A]/60 font-bold max-w-sm mx-auto">
                  {error}
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-black text-[#3D418A]">Connection Interrupted</h3>
                <p className="text-[#3D418A]/60 font-bold max-w-sm mx-auto">
                  {error}. Please ensure the SkillmatriX backend is active at <code className="bg-white/40 px-2 py-0.5 rounded text-[#c86ad6] text-xs">localhost:8080</code>.
                </p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-[#3D418A] text-[#a8e6cf] font-black text-xs tracking-[0.2em] uppercase rounded-full hover:shadow-2xl transition-all"
              >
                Retry Reconnection
              </button>
              
              <button
                onClick={() => (window.location.href = "/skill-gap")}
                className="px-8 py-3 bg-[#3D418A] text-[#a8e6cf] font-black text-xs tracking-[0.2em] uppercase rounded-full hover:shadow-2xl transition-all"
              >
                Go to Skill Gap
              </button>

            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              <RoadmapDisplay roadmap={roadmapData} role={role} />
            </motion.div>
          )}
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}