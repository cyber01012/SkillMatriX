
"use client";

import React, { useEffect, useRef, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import ProfileCard from "@/components/dashboard/ProfileCard";
import KPICard from "@/components/dashboard/KPICard";
import SkillsGraph from "@/components/dashboard/SkillsGraph";
import JobsSection from "@/components/dashboard/JobsSection";
import ChatbotPanel from "@/components/dashboard/ChatbotPanel";
import { Zap, Target } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ScrollAnimationWrapper from "@/components/animation/ScrollAnimationWrapper";
import ActivitySection from "@/components/dashboard/ActivitySection";

/* -------------------- API Base + Headers -------------------- */
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

const authHeaders = () => {
  const t =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
  };
};

export default function Dashboard() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isChatFullView, setIsChatFullView] = useState(false);
  const scrollTimeoutRef = useRef(null);

  const [hasSkillDataFromSession, setHasSkillDataFromSession] = useState(null);

  const handleScroll = () => {
    setIsScrolling(true);
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => setIsScrolling(false), 1500);
  };

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  /* -------------------- Backend Summary (+ Activity optional) -------------------- */
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");
  // If you want to feed ActivitySection with data, toggle to true and use activityItems
  const [activityItems, setActivityItems] = useState([]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        // SUMMARY
        const res = await fetch(`${API_BASE}/api/dashboard/summary`, {
          method: "GET",
          headers: authHeaders(),
          credentials: "omit",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(`Summary HTTP ${res.status}`);
        const s = await res.json();
        setSummary(s);

        // Optional: ACTIVITY (comment if not needed)
        try {
          const resAct = await fetch(
            `${API_BASE}/activity/me/minimal?limit=50`,
            {
              method: "GET",
              headers: authHeaders(),
              credentials: "omit",

              signal: ac.signal,
            }
          );
          if (resAct.ok) {
            const a = await resAct.json();
            setActivityItems(Array.isArray(a) ? a : []);
          }
        } catch {
          // ignore activity errors silently
        }
      } catch (err) {
        if (!ac.signal.aborted) {
          console.error("Dashboard summary load failed:", err);
          setSummaryError("Failed to load your dashboard summary.");
        }
      } finally {
        if (!ac.signal.aborted) setSummaryLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  /* -------------------- Derived user model (no static) -------------------- */
  const userData = summary
    ? {
      name: summary.userName || "User",
      role: summary.targetRole || "",
      stats: summary.stats || { roadmaps: 0, reports: 0, resumes: 0 },
      skillsData: summary.skills || { strong: 0, weak: 0, missing: 0 },
      jobs: Array.isArray(summary.jobs) ? summary.jobs : [],
      lastRecId: summary.lastRecId || null,
      matchPercentage:
        typeof summary.matchPercentage === "number"
          ? summary.matchPercentage
          : 0,
    }
    : {
      name: "Loading…",
      role: "",
      stats: { roadmaps: 0, reports: 0, resumes: 0 },
      skillsData: { strong: 0, weak: 0, missing: 0 },
      jobs: [],
      matchPercentage: 0,
    };

  const skillsExtracted =
    (userData.skillsData?.strong ?? 0) +
    (userData.skillsData?.weak ?? 0) +
    (userData.skillsData?.missing ?? 0);

  // Prefer server flag if present; else derive

  const effectiveHasSkillData =
    hasSkillDataFromSession ??
    ((summary && typeof summary.hasSkillData === "boolean"
      ? summary.hasSkillData
      : skillsExtracted > 0) || false);


  /* -------------------- Chat (lifted, your endpoints) -------------------- */
  const [messages, setMessages] = useState([
    // NOTE: If you want zero initial bot message, set [] here.
    {
      type: "bot",
      text:
        "Welcome to your Strategic Command Center.\n\nI'm ready to assist with your roadmap, gap analysis, or simulations. What is our first objective? ",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);



  // Restore/create chat session AFTER summary is ready (so we have the real role)
  useEffect(() => {
    // ⛔ Wait until summary has loaded before initializing chat
    if (!summary) return;

    let cancelled = false;

    async function bootstrap() {
      const saved = localStorage.getItem("skill_chat_session_id");
      if (saved) {
        setSessionId(parseInt(saved, 10));
        await fetchHistory(saved);
      } else {
        await initSession();
      }
    }

    async function fetchHistory(id) {
      try {
        const res = await fetch(`${API_BASE}/api/chat/history/${id}`, {
          method: "GET",
          headers: authHeaders(),
          credentials: "omit",
        });
        if (!cancelled && res.ok) {
          const history = await res.json();
          if (Array.isArray(history) && history.length > 0) {
            const formatted = history.map((msg) => ({
              type: msg.role === "assistant" ? "bot" : "user",
              text: msg.content,
            }));
            setMessages(formatted);
          }
        } else if (!cancelled) {
          await initSession();
        }
      } catch (e) {
        console.error("Error fetching chat history:", e);
        if (!cancelled) await initSession();
      }
    }

    async function initSession() {
      try {
        const res = await fetch(`${API_BASE}/api/chat/session`, {
          method: "POST",
          headers: authHeaders(),
          credentials: "omit",
          body: JSON.stringify({
            targetRole: userData.role || "Full Stack Developer",
            matchPercentage: userData.matchPercentage ?? 0,
            cvSkills: [], // send your parsed skills if available
            skillGap: {}, // send your gap object if available
          }),
        });
        if (!cancelled && res.ok) {
          const data = await res.json();
          setSessionId(data.sessionId);
          localStorage.setItem("skill_chat_session_id", data.sessionId);


          // ✅ take server's truth for hasSkillData
          if (typeof data.hasSkillData === "boolean") {
            setHasSkillDataFromSession(data.hasSkillData);
          }

          if (!data.hasSkillData) {
            setMessages([
              {
                type: "bot",
                text: checkInitialSkillData()
                  ? `Welcome to your Strategic Command Center.\n\nI've finalized the analysis of your profile for the **${profileIntelligence.targetRole}** track. I am ready to optimize your roadmap, bridge your skill gaps, or simulate career scenarios.\n\nWhat is our first objective?`
                  : `I am your Strategic Co-Pilot, but my intelligence is currently restricted. To activate my full capabilities, including skill gap mapping, roadmaps, and career simulations, I require your profile data.\n\n**PLEASE UPLOAD YOUR RESUME ON THE DASHBOARD** to unlock the full potential of this command center.`


              },
            ]);
          }
        }
      } catch (e) {
        console.error("Error creating chat session:", e);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]); // ✅ runs only after summary is fetched

  const handleSendMessage = async (text = inputText) => {
    // ✅ Defensive guard (no change to your prompt/response content)
    const raw = typeof text === "string" ? text : inputText;
    const messageToSend = (raw ?? "").trim();
    if (!messageToSend || !sessionId || isLoading) return;

    setMessages((prev) => [...prev, { type: "user", text: messageToSend }]);
    setInputText("");
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat/message`, {
        method: "POST",
        headers: authHeaders(),
        credentials: "omit",
        body: JSON.stringify({ sessionId, content: messageToSend }),
      });

      const botText = await response.text(); // server may return plain text
      setMessages((prev) => [...prev, { type: "bot", text: botText }]);
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        { type: "bot", text: "Communication node failed. Please re-engage." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /* -------------------- UI -------------------- */
  return (
    <main className="flex h-screen w-full bg-[#A8E6CF] overflow-hidden relative">
      {/* Sidebar */}
      <div
        className={`transition-all duration-300 ${isSidebarCollapsed ? "w-20" : "w-68"
          } ${isChatFullView ? "blur-md pointer-events-none" : ""}`}
      >
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
        />
      </div>

      {/* Main Content */}
      <div
        onScroll={handleScroll}
        className={`flex-1 overflow-y-auto px-6 pb-6 pt-5 custom-scrollbar overflow-x-hidden transition-all duration-500 ${isScrolling ? "is-scrolling" : ""
          } ${isChatFullView ? "blur-md scale-[0.98] pointer-events-none" : ""}`}
      >
        <div className="max-w-5xl mx-auto flex flex-col gap-6">
          <ScrollAnimationWrapper>
            <DashboardHeader userName={userData.name} />
          </ScrollAnimationWrapper>

          {/* Error banner (summary) */}
          {!summaryLoading && summaryError && (
            <div className="rounded-md border border-red-200 bg-red-50 text-red-700 p-3 text-sm">
              {summaryError}
            </div>
          )}

          {/* Top Row */}
          <ScrollAnimationWrapper>
            <div className="flex flex-col xl:flex-row gap-10 items-stretch">
              <div className="w-full lg:w-3/5 shrink-0 h-full">
                <ProfileCard
                  name={userData.name}
                  role={userData.role}
                  stats={userData.stats}
                />
              </div>

              <div className="flex flex-col gap-6 w-full lg:w-2/5 flex-1 self-stretch">
                <ScrollAnimationWrapper className="flex-1">
                  <KPICard
                    title="Skills Extracted"
                    value={String(skillsExtracted)}
                    unit="Total"
                    icon={Target}
                    color="teal"
                  />
                </ScrollAnimationWrapper>
                <ScrollAnimationWrapper className="flex-1">
                  <KPICard
                    title="Target Role Match"
                    value={String(userData.matchPercentage)}
                    unit="%"
                    icon={Zap}
                    color="purple"
                  />
                </ScrollAnimationWrapper>
              </div>
            </div>
          </ScrollAnimationWrapper>

          {/* Middle */}
          <ScrollAnimationWrapper>
            <div className="grid grid-cols-1">
              <SkillsGraph data={userData.skillsData} />
            </div>
          </ScrollAnimationWrapper>

          {/* Bottom: Jobs */}
          <ScrollAnimationWrapper>
            <div className="grid grid-cols-1">
              <JobsSection jobs={userData.jobs} />
            </div>
          </ScrollAnimationWrapper>

          {/* Activity (use items={activityItems} if your component expects it) */}
          <ScrollAnimationWrapper>
            <div className="grid grid-cols-1">
              <ActivitySection items={activityItems} />
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>

      {/* Chatbot Panel (Right) */}
      <div
        className={`hidden lg:block w-[300px] xl:w-[340px] shrink-0 h-full p-6 bg-[#BDEFD9] transition-all duration-500 ${isChatFullView ? "blur-md pointer-events-none" : ""
          }`}
      >
        <div className="h-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/20">
          <ChatbotPanel
            isFullView={false}
            onToggle={() => setIsChatFullView(true)}
            onInteract={() => setIsChatFullView(true)}
            messages={messages}
            inputText={inputText}
            setInputText={setInputText}
            sessionId={sessionId}
            hasSkillData={effectiveHasSkillData}
            // hasSkillData={hasSkillData}
            isLoading={isLoading}
            onSendMessage={handleSendMessage}
            role={userData.role}
            match={userData.matchPercentage}
          />
        </div>
      </div>

      {/* Chat Full View (Modal) */}
      {isChatFullView && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-[#2A2771]/40 backdrop-blur-sm cursor-zoom-out"
            onClick={() => setIsChatFullView(false)}
          />
          <div className="relative w-full max-w-2xl h-[85vh] rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 animate-in zoom-in-95 duration-500">
            <ChatbotPanel
              isFullView={true}
              onToggle={() => setIsChatFullView(false)}
              onInteract={() => setIsChatFullView(true)}
              messages={messages}
              inputText={inputText}      /* ✅ make sure this is NOT setInputText */
              setInputText={setInputText}
              sessionId={sessionId}
              hasSkillData={effectiveHasSkillData}
              // hasSkillData={hasSkillData}
              isLoading={isLoading}
              onSendMessage={handleSendMessage}
              role={userData.role}
              match={userData.matchPercentage}
            />
          </div>
        </div>
      )}
    </main>
  );
}
