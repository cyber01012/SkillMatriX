
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import api from "@/lib/axios"; // axios with baseURL + auth interceptor

export default function ProfileCard({ name, role, stats }) {
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState("");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

  // Helper: convert relative (/uploads/xyz.jpg) -> absolute (http://localhost:8080/uploads/xyz.jpg)
  const toAbsolute = (raw) =>
    raw
      ? raw.startsWith("http")
        ? raw
        : `${API_BASE}${raw.startsWith("/") ? raw : `/${raw}`}`
      : null;

  // Helper: fallback avatar (NOTE: use '&' not '&amp;')
  const makeFallback = (u) => {
    const full = `${(u.firstName || "").trim()} ${(u.lastName || "").trim()}`.trim();
    const name = full || (u.username || "User");
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=A8E6CF&color=2A2771&bold=true&size=256`;
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get("/user/profile"); // backend returns profileImage=/uploads/...
        if (cancelled) return;
        const u = res.data || {};
        setUser(u);

        const raw = u.profileImage || u.avatarUrl; // backend keys (you’re sending 'profileImage' = profilePhotoUrl)
        const resolved = toAbsolute(raw) || makeFallback(u);
        setProfileImage(resolved);
      } catch (err) {
        console.error("Profile fetch error", err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await api.post("/user/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const rawUrl =
        res.data?.profilePhotoUrl || res.data?.url || res.data?.profileImage;
      const resolvedUrl = toAbsolute(rawUrl);
      if (resolvedUrl) {
        // cache-bust to force refresh
        setProfileImage(`${resolvedUrl}?t=${Date.now()}`);
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      e.target.value = "";
    }
  }; // <-- ✅ close the function properly

  if (!user) {
    return (
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#A8E6CF]/20 w-full">
        <div className="animate-pulse h-32 w-32 rounded-full bg-slate-200 mx-auto mb-4" />
        <div className="h-4 bg-slate-200 rounded w-1/3 mx-auto mb-2" />
        <div className="h-3 bg-slate-100 rounded w-1/4 mx-auto" />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-[#A8E6CF]/20 flex flex-col items-center w-full">
      {/* profile */}
      <div className="flex flex-col items-center text-center gap-4 w-full mb-6">
        <div
          className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-[#A8E6CF]/30 shadow-xl cursor-pointer"
          onClick={handleUploadClick}
        >
          <img
            src={profileImage}
            alt="Profile"
            className="w-full h-full object-cover"
            onError={(e) => {
              // if broken, fall back
              const fallback = makeFallback(user);
              if (e.currentTarget.src !== fallback) {
                e.currentTarget.src = fallback;
              }
            }}
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
            <Camera className="text-white" size={22} />
          </div>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>

        <h2 className="text-xl font-black text-[#2A2771]">
          {`${(user.firstName || "").trim()} ${(user.lastName || "").trim()}`.trim() ||
            user.username ||
            "User"}
        </h2>

        {role && (
          <span className="px-4 py-1 bg-[#26B291]/10 rounded-full text-[#26B291] text-[10px] font-black uppercase tracking-widest">
            {role}
          </span>
        )}
      </div>

      {/* stats (from props) */}
      <div className="grid grid-cols-3 gap-3 w-full pt-6 border-t border-slate-50 relative z-10">
        <div className="flex flex-col items-center group/stat">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center mb-2 text-indigo-600 group-hover/stat:bg-indigo-600 group-hover/stat:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2Z" /><path d="M12 10V4" /><path d="m8 8 4-4 4 4" /></svg>
          </div>
          <span className="text-lg font-black text-[#2A2771]">{stats?.roadmaps ?? 0}</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center">Roadmaps</span>
        </div>

        <div className="flex flex-col items-center group/stat">
          <div className="w-9 h-9 bg-[#26B291]/10 rounded-xl flex items-center justify-center mb-2 text-[#26B291] group-hover/stat:bg-[#26B291] group-hover/stat:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><path d="M12 18v-6" /><path d="M8 15h8" /></svg>
          </div>
          <span className="text-lg font-black text-[#2A2771]">{stats?.reports ?? 0}</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center">Reports</span>
        </div>

        <div className="flex flex-col items-center group/stat">
          <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center mb-2 text-purple-600 group-hover/stat:bg-purple-600 group-hover/stat:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </div>
          <span className="text-lg font-black text-[#2A2771]">{stats?.resumes ?? 0}</span>
          <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-center">Resumes</span>
        </div>
      </div>
    </div>
  );
}
