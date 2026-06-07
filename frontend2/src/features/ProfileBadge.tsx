
"use client";

import React, { useEffect, useState } from "react";

const API_BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8080";

/** Attach bearer token from localStorage */
function authHeader(): Record<string, string> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem("accessToken") ?? "";
  const token = raw.replace(/^"|"$/g, "").trim();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/* -------------------- Shared helpers -------------------- */

type MinimalUser = {
  firstName?: string;
  lastName?: string;
  username?: string;
  profileImage?: string; // /uploads/...
  avatarUrl?: string;    // absolute or relative
};

function toAbsolute(raw?: string | null): string | null {
  if (!raw) return null;
  if (raw.startsWith("http")) return raw;
  return `${API_BASE}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function resolveName(u: MinimalUser | null) {
  if (!u) return "";
  const full = `${(u.firstName || "").trim()} ${(u.lastName || "").trim()}`.trim();
  return full || u.username || "User";
}

function makeFallback(u: MinimalUser | null) {
  const name = resolveName(u) || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=A8E6CF&color=2A2771&bold=true&size=128`;
}

function useAutoProfile() {
  const [user, setUser] = useState<MinimalUser | null>(null);
  const [img, setImg] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/user/profile`, {
          headers: { ...authHeader() },
        });
        if (!res.ok) throw new Error("profile fetch failed");

        const u = (await res.json()) as MinimalUser;
        if (cancel) return;

        setUser(u);
        const raw = u.profileImage || u.avatarUrl || "";
        const resolved = toAbsolute(raw) || makeFallback(u);
        setImg(resolved);
      } catch {
        if (cancel) return;
        setUser(null);
        setImg(makeFallback(null));
      } finally {
        if (!cancel) setLoading(false);
      }
    })();

    return () => {
      cancel = true;
    };
  }, []);

  return { user, img, loading, name: resolveName(user) };
}

/* =====================================================================
   VARIANT B: Inline “Glassy” Profile Badge (auto-fetch)
   • Color/UI: light, mint/white glass chip.
   • Place: Top bar right/left of “Back to Dashboard”.
   ===================================================================== */

export function GlassProfileBadgeAuto({
  align = "right",
  showName = true,
  className = "",
  tooltip = "Signed in",
  onClick,
}: {
  align?: "left" | "right";
  showName?: boolean;
  className?: string;
  tooltip?: string;
  onClick?: () => void;
}) {
  const { user, img, loading, name } = useAutoProfile();
  const wrapperAlign = align === "left" ? "justify-start" : "justify-end";
  const displayName = name || "User";

  return (
    // ⬇️ MAKE WRAPPER THE GROUP + RELATIVE
    <div className={["relative", "group", className].join(" ")}>
      <div className={["flex items-center", wrapperAlign].join(" ")}>
        <button
          type="button"
          onClick={onClick}
          className="
            inline-flex items-center gap-2 rounded-2xl
            px-2.5 py-1.5 border transition-all
            backdrop-blur-md
            bg-white/20 hover:bg-white/30
            border-white/30 hover:border-white/40
            shadow-[0_6px_18px_rgba(28,33,61,0.08)]
          "
          style={{ WebkitBackdropFilter: "blur(6px)" }}
          aria-label={tooltip}
        >
          {/* Avatar */}
          <span
            className="inline-block w-7 h-7 rounded-full overflow-hidden border"
            style={{ borderColor: "#A8E6CF" }}
          >
            {loading ? (
              <span className="block w-full h-full bg-slate-200 animate-pulse" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const fallback = makeFallback(user);
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
              />
            )}
          </span>

          {/* Name */}
          {showName && (
            <span
              className="text-sm font-semibold transition-colors"
              style={{ color: "#3D418A" }}
            >
              {loading ? (
                <span className="inline-block w-16 h-3 bg-slate-200 rounded animate-pulse" />
              ) : (
                displayName
              )}
            </span>
          )}
        </button>
      </div>

      {/* ⬇️ Tooltip is a CHILD of the .group wrapper now */}
      <div
        role="tooltip"
        className="
          pointer-events-none absolute right-0 mt-2
          px-2.5 py-1.5 text-xs font-semibold
          rounded-xl border
          opacity-0 group-hover:opacity-100
          transition-opacity
          backdrop-blur-md
          bg-black/20
          border-white/30
          text-white
          whitespace-nowrap
          z-20
        "
        style={{ WebkitBackdropFilter: "blur(6px)" }}
      >
        {tooltip}
      </div>
    </div>
  );
}


/* =====================================================================
   VARIANT C: Under-Header “Glass Strip” (auto-fetch)
   • Color/UI: deeper indigo glass (darker hover), stronger presence.
   • Place: Back button ke NEECHAY as a full-width-ish strip.
   ===================================================================== */
export function UnderHeaderGlassStripAuto({
  className = "",
  hint = "You’re signed in",
  dense = false, // smaller vertical padding if true
}: {
  className?: string;
  hint?: string;
  dense?: boolean;
}) {
  const { user, img, loading, name } = useAutoProfile();
  const displayName = name || "User";

  return (
    <div className={["relative mt-3 rounded-2xl overflow-hidden", className].join(" ")}>
      {/* Indigo-toned glass strip */}
      <div
        className={`
          flex items-center justify-between
          px-3 ${dense ? "py-1.5" : "py-2.5"}
          border transition-colors
          backdrop-blur-md
          bg-[rgba(61,65,138,0.14)] hover:bg-[rgba(61,65,138,0.22)]
          border-[rgba(233,234,247,0.8)]
          shadow-[0_10px_30px_rgba(28,33,61,.08)]
        `}
        style={{ WebkitBackdropFilter: "blur(8px)" }}
      >
        {/* Left: avatar + name */}
        <div className="flex items-center gap-2">
          <span
            className="inline-block w-8 h-8 rounded-full overflow-hidden border"
            style={{ borderColor: "#A8E6CF" }}
            aria-hidden
          >
            {loading ? (
              <span className="block w-full h-full bg-slate-200 animate-pulse" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img}
                alt={displayName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const fallback = makeFallback(user);
                  if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                }}
              />
            )}
          </span>
          <span
            className="text-sm font-bold"
            style={{ color: loading ? "#6B7280" : "#FFFFFF" }}
          >
            {loading ? "Loading…" : displayName}
          </span>
        </div>

        {/* Right: hint (fades less because darker bg) */}
        <span className="text-[11px] font-semibold text-white/90">
          {hint}
        </span>
      </div>
    </div>
  );
}
