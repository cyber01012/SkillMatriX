
export function normalizeActivity(item) {
  // Backend returns:
  //   { title, time, station, sessionId, sessionActive, type, riskScore }
  // OR sometimes: { eventType, createdAt, device, status }
  const title = item?.title ?? (
    (item?.eventType || "").toUpperCase() === "LOGIN" ? "Login" :
    (item?.eventType || "").toUpperCase().startsWith("LOGOUT") ? "Logout" :
    "Activity"
  );

  // Try fields in order: time, createdAt, timestamp
  const when = item?.time || item?.createdAt || item?.timestamp || null;
  const dateObj = when ? new Date(when) : null;

  // Fall back if parsing fails (avoid "Invalid Date")
  const safeDate = (d) => (d instanceof Date && !isNaN(d)) ? d : new Date(0);

  const d = safeDate(dateObj);

  const station = item?.station ?? item?.device ?? "Station 01";
  const isLogin = (title || "").toLowerCase().includes("login");
  const sessionActive =
    typeof item?.sessionActive === "boolean"
      ? item.sessionActive
      : (item?.status === "SUCCESS");

  return {
    type: isLogin ? "login" : "logout",
    title,
    dateText: d.toLocaleDateString(),
    timeText: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    station,
    sessionActive,
  };
}
