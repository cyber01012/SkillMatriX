
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SmartInput, { MailIcon, LockIcon } from "./ui/SmartInput.jsx";

import { getPasswordStrength } from "./form/PasswordStrength";

/** Brand tones */
const INDIGO = "#2A2771";

/** Background gradient shell */
const shellGradient =
  "bg-gradient-to-br from-[#6be7cf] via-[#7cbddc] to-[#adb6e5]";

/** Glass card */
const cardCls = `
  rounded-2xl bg-white/50 backdrop-blur-md shadow-xl border border-white/40
  px-6 sm:px-7 py-6 sm:py-7
`;

/** Step transitions */
const stepVariants = {
  initial: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }),
};

/** Card in/out */
const cardVariants = {
  initial: { opacity: 0, scale: 0.94, y: 18 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, scale: 0.94, y: 18, transition: { duration: 0.25, ease: "easeIn" } },
};

export default function ForgotWindow({
  appLogoSrc = "/favicon.ico",
  appName = "SkillmatriX",
  onClose,
  onBackToLogin,
  onSendOtp,
  onVerifyOtp,
  onResetPassword,
}) {
  /** steps: 0=email, 1=otp, 2=reset */
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  /** Close (X) show/hide */
  const [showClose, setShowClose] = useState(false);
  const closeTimer = useRef(null);
  const revealClose = () => {
    setShowClose(true);
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setShowClose(false), 1200);
  };

  /** OTP step timer (15 min) */
  const OTP_WINDOW_SECS = 15 * 60;
  const [secsLeft, setSecsLeft] = useState(OTP_WINDOW_SECS);
  const timerRef = useRef(null);
  const mmss = useMemo(() => {
    const m = String(Math.floor(secsLeft / 60)).padStart(2, "0");
    const s = String(secsLeft % 60).padStart(2, "0");
    return `${m}:${s}`;
  }, [secsLeft]);

  useEffect(() => {
    if (step === 1) {
      clearInterval(timerRef.current);
      setSecsLeft(OTP_WINDOW_SECS);
      timerRef.current = setInterval(() => {
        setSecsLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  /** Navigation */
  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setMsg({ type: "", text: "" });
  };

  /** =============== RESEND POLICY =========================
   * - Same email:
   *   - 1st send → no cooldown
   *   - 2nd resend → no cooldown
   *   - 3rd+ resend → 1-hour cooldown
   * - On email change → reset policy for that email
   * =======================================================*/

  const RESEND_COOLDOWN_SECS = 60 * 60; // 1 hour
  const normalizeEmail = (e) => (e || "").trim().toLowerCase();

  const [resendMeta, setResendMeta] = useState({ count: 0, lastResendAt: null });
  const [resendLeft, setResendLeft] = useState(0);

  const loadMeta = (em) => {
    if (!em) return { count: 0, lastResendAt: null };
    try {
      const raw = localStorage.getItem(`fp_resend_meta:${em}`);
      if (!raw) return { count: 0, lastResendAt: null };
      const parsed = JSON.parse(raw);
      return {
        count: Number(parsed?.count) || 0,
        lastResendAt: Number(parsed?.lastResendAt) || null,
      };
    } catch {
      return { count: 0, lastResendAt: null };
    }
  };

  const saveMeta = (em, meta) => {
    if (!em) return;
    localStorage.setItem(`fp_resend_meta:${em}`, JSON.stringify(meta));
  };

  const normEmail = normalizeEmail(email);
  useEffect(() => {
    const meta = loadMeta(normEmail);
    setResendMeta(meta);
  }, [normEmail]);

  useEffect(() => {
    const id = setInterval(() => {
      if (!normEmail || resendMeta.count < 2 || !resendMeta.lastResendAt) {
        setResendLeft(0);
        return;
      }
      const elapsed = Math.floor((Date.now() - resendMeta.lastResendAt) / 1000);
      const left = Math.max(RESEND_COOLDOWN_SECS - elapsed, 0);
      setResendLeft(left);
    }, 1000);
    return () => clearInterval(id);
  }, [normEmail, resendMeta]);

  const fmtHMS = (total) => {
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  /** Actions */
  const handleNext = async () => {
    if (step === 0) {
      setMsg({ type: "", text: "" });
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setMsg({ type: "error", text: "Please enter a valid email." });
        return;
      }
      setLoading(true);
      try {
        await onSendOtp?.(email);
        setMsg({ type: "success", text: "OTP sent. Expires in 15 minutes." });

        const current = loadMeta(normEmail);
        const updated = { ...current, count: Math.max(1, (current.count || 0) + 1) };
        setResendMeta(updated);
        saveMeta(normEmail, updated);

        go(1);
      } catch (e) {
        setMsg({ type: "error", text: e?.message ?? "Failed to send OTP." });
      } finally {
        setLoading(false);
      }
    } else if (step === 1) {
      setMsg({ type: "", text: "" });
      if (!otp || otp.length < 4) {
        setMsg({ type: "error", text: "Please enter the OTP code." });
        return;
      }
      if (secsLeft === 0) {
        setMsg({ type: "error", text: "OTP expired. Please resend." });
        return;
      }
      setLoading(true);
      try {
        await onVerifyOtp?.({ email, otp });
        setMsg({ type: "success", text: "OTP verified." });
        go(2);
      } catch (e) {
        setMsg({ type: "error", text: e?.message ?? "Invalid OTP." });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step === 0) return;
    if (step === 2) go(1);
    else if (step === 1) go(0);
  };

  const resendOtp = async () => {
    const current = loadMeta(normEmail);
    const isPostThreshold = (current.count || 0) >= 2;

    if (isPostThreshold && current.lastResendAt) {
      const elapsed = Math.floor((Date.now() - current.lastResendAt) / 1000);
      const left = RESEND_COOLDOWN_SECS - elapsed;
      if (left > 0) {
        setMsg({ type: "error", text: "Sorry, try after an hour." });
        return;
      }
    }

    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      await onSendOtp?.(email);

      let updated;
      if (!isPostThreshold) {
        updated = { ...current, count: (current.count || 0) + 1 };
        setMsg({ type: "success", text: "New OTP sent." });
      } else {
        updated = {
          ...current,
          count: (current.count || 0) + 1,
          lastResendAt: Date.now(),
        };
        setMsg({ type: "success", text: "New OTP sent. Cooldown: 1 hour." });
      }

      setResendMeta(updated);
      saveMeta(normEmail, updated);

      clearInterval(timerRef.current);
      setSecsLeft(OTP_WINDOW_SECS);
      timerRef.current = setInterval(() => {
        setSecsLeft((t) => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } catch (e) {
      setMsg({ type: "error", text: e?.message ?? "Failed to resend OTP." });
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async () => {
    setMsg({ type: "", text: "" });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsg({ type: "error", text: "Please enter a valid email." });
      return;
    }
    if (!newPwd || newPwd.length < 8) {
      setMsg({ type: "error", text: "Password must be at least 8 characters." });
      return;
    }
    if (newPwd !== confirmPwd) {
      setMsg({ type: "error", text: "Passwords do not match." });
      return;
    }
    setLoading(true);
    try {
      await onResetPassword?.({ email, otp, newPassword: newPwd });
      setMsg({ type: "success", text: "Password updated. You can log in now." });
    } catch (e) {
      setMsg({ type: "error", text: e?.message ?? "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BACKDROP */}
      <motion.div
        className="fixed inset-0 z-40 bg-black/35 backdrop-blur-[12px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* CENTERED WINDOW */}
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onMouseMove={revealClose}
      >
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={`relative w-[94%] sm:w-[420px] md:w-[480px] ${shellGradient} rounded-2xl shadow-2xl overflow-visible`}
          style={{ boxShadow: "0 22px 54px rgba(61,162,255,0.25)" }}
        >
          {/* Close (X) */}
          <button
            onClick={onClose}
            aria-label="Close"
            className={`absolute -top-3 -right-3 rounded-full bg-white/90 text-[#2A2771] shadow-md transition ${
              showClose ? "opacity-100" : "opacity-0"
            } hover:scale-105`}
            style={{ padding: "6px 8px" }}
          >
            ✕
          </button>

          {/* GLASS CARD */}
          <div className="px-6 pb-6 pt-3">
            <div
              className={cardCls}
              style={{
                boxShadow:
                  "0 14px 40px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.35)",
              }}
            >
              {/* Header: logo + name (indigo) */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <img
                  src={appLogoSrc}
                  alt={`${appName} logo`}
                  className="h-9 w-9 rounded-md object-contain"
                />
                <span className="text-lg sm:text-xl font-semibold text-[#2A2771]">
                  {appName}
                </span>
              </div>

              {/* Title + Back */}
              <div className="flex items-center justify-between mb-6">
                <div className="text-2xl sm:text-[28px] font-semibold text-[#2A2771] tracking-tight drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                  Reset password
                </div>
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 0}
                  className={`text-sm font-semibold ${
                    step === 0
                      ? "text-[#2A2771]/40 cursor-not-allowed"
                      : "text-[#2A2771]/80 hover:text-[#2A2771]"
                  }`}
                >
                  ← Back
                </button>
              </div>

              {/* STATUS MESSAGE */}
              {msg.text ? (
                <div
                  className={`mb-3 text-sm rounded-lg px-3 py-2 ${
                    msg.type === "error"
                      ? "bg-red-50/70 text-red-700"
                      : "bg-emerald-50/70 text-emerald-700"
                  }`}
                >
                  {msg.text}
                </div>
              ) : null}

              {/* CONTENT */}
              <div className="relative">
                <AnimatePresence custom={dir} mode="wait">
                  {/* STEP 1 — EMAIL (white inputs) */}
                  {step === 0 && (
                    <motion.div
                      key="step-email"
                      custom={dir}
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-4"
                    >
                      <SmartInput
                        id="fp-email"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                        icon={MailIcon}
                        status={
                          email
                            ? /^\S+@\S+\.\S+$/.test(email)
                              ? "valid"
                              : "invalid"
                            : "idle"
                        }
                        message={
                          email && !/^\S+@\S+\.\S+$/.test(email)
                            ? "Please enter a valid email"
                            : ""
                        }
                      />
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading}
                        className={`w-full rounded-xl bg-[#3D418A] text-white font-semibold py-2.5 hover:bg-[#343782] transition ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {loading ? "Sending..." : "Send OTP"}
                      </button>
                    </motion.div>
                  )}

                  {/* STEP 2 — OTP (white inputs) */}
                  {step === 1 && (
                    <motion.div
                      key="step-otp"
                      custom={dir}
                      variants={stepVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-4"
                    >
                      <SmartInput
                        id="fp-otp"
                        label="OTP Code"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        inputMode="numeric"
                        maxLength={6}
                        icon={LockIcon}
                        status={
                          otp.length === 6 ? "valid" : otp ? "invalid" : "idle"
                        }
                        message={otp && otp.length < 6 ? "Enter 6 digits" : ""}
                      />

                      {/* Timer + Resend (indigo color + policy) */}
                      {(() => {
                        const count = resendMeta.count || 0;
                        const isPostThreshold = count >= 2;
                        const disabled = loading || (isPostThreshold && resendLeft > 0);
                        const label = isPostThreshold && resendLeft > 0
                          ? `Resend in ${fmtHMS(resendLeft)}`
                          : "Resend OTP";

                        return (
                          <div className="flex items-center justify-between text-xs text-[#2A2771]/80">
                            <span>
                              Expires in:{" "}
                              <span className="font-semibold text-[#2A2771]">
                                {mmss}
                              </span>
                            </span>

                            <button
                              type="button"
                              onClick={resendOtp}
                              disabled={disabled}
                              className={`font-semibold transition ${
                                disabled
                                  ? "text-[#2A2771]/40 cursor-not-allowed"
                                  : "text-[#2A2771] hover:underline"
                              }`}
                              title={
                                isPostThreshold && resendLeft > 0
                                  ? `Try after ${fmtHMS(resendLeft)}`
                                  : "Resend OTP"
                              }
                            >
                              {label}
                            </button>
                          </div>
                        );
                      })()}

                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={loading || otp.length < 6}
                        className={`w-full rounded-xl bg-[#3D418A] text-white font-semibold py-2.5 hover:bg-[#343782] transition ${
                          loading ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                      >
                        {loading ? "Verifying..." : "Verify OTP"}
                      </button>
                    </motion.div>
                  )}

                  
{/* STEP 3 — RESET PASSWORD (white inputs) */}
{step === 2 && (
  <motion.div
    key="step-reset"
    custom={dir}
    variants={stepVariants}
    initial="initial"
    animate="animate"
    exit="exit"
    className="space-y-4"
  >
    {/* Email */}
    <SmartInput
      id="fp-login-email"
      label="Email"
      type="email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      autoComplete="email"
      icon={MailIcon}
      status={
        email
          ? /\S+@\S+\.\S+/.test(email)
            ? "valid"
            : "invalid"
          : "idle"
      }
      message={
        email && !/\S+@\S+\.\S+/.test(email)
          ? "Please enter a valid email"
          : ""
      }
    />

    {/* New Password (>= 6) */}
    <SmartInput
      id="fp-new-password"
      label="New Password"
      type="password"
      value={newPwd}
      onChange={(e) => setNewPwd(e.target.value)}
      autoComplete="new-password"
      icon={LockIcon}
      status={
        newPwd.length >= 6
          ? "valid"
          : newPwd
          ? "invalid"
          : "idle"
      }
      message={
        newPwd && newPwd.length < 6
          ? "At least 6 characters"
          : ""
      }
    />

    {/* Strength bar (Forgot step only) */}
    {(() => {
      const s = getPasswordStrength(newPwd);
      const pct = [0, 25, 50, 75, 100][s.score];
      return (
        <div className="mt-1">
          <div className="h-1.5 w-full rounded bg-black/10 overflow-hidden">
            <div
              className="h-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: s.color }}
            />
          </div>
          <div className="mt-1 text-[11px] text-[#2A2771]/70">{s.label}</div>
        </div>
      );
    })()}

    {/* Confirm Password */}
    <SmartInput
      id="fp-confirm-password"
      label="Confirm Password"
      type="password"
      value={confirmPwd}
      onChange={(e) => setConfirmPwd(e.target.value)}
      autoComplete="new-password"
      icon={LockIcon}
      status={
        confirmPwd ? (confirmPwd === newPwd ? "valid" : "invalid") : "idle"
      }
      message={
        confirmPwd && confirmPwd !== newPwd
          ? "Passwords do not match"
          : ""
      }
    />

    {/* CTA */}
    <button
      type="button"
      onClick={updatePassword}
      disabled={loading}
      className={`w-full rounded-xl bg-[#3D418A] text-white font-semibold py-2.5 hover:bg-[#343782] transition ${
        loading ? "opacity-70 cursor-not-allowed" : ""
      }`}
    >
      {loading ? "Updating..." : "Update Password"}
    </button>
  </motion.div>
)}
</AnimatePresence>          
        </div>             

              {/* DOTS — more visible */}
              <div className="mt-4 flex items-center justify-center gap-2">
                {[0, 1, 2].map((i) => {
                  const active = i === step;
                  return (
                    <div
                      key={i}
                      className={`h-2.5 w-2.5 rounded-full ${
                        active ? "bg-[#2A2771]" : "bg-white/70"
                      } transition`}
                      style={
                        active
                          ? {
                              boxShadow:
                                "0 0 0 2px rgba(255,255,255,0.65), 0 0 0 5px rgba(42,39,113,0.22)",
                            }
                          : {}
                      }
                      aria-label={`step-${i + 1}`}
                    />
                  );
                })}
              </div>

              {/* REMEMBER + NEXT — extra breathing room after dots */}
              <div className="mt-5 flex items-center justify-between text-sm">
                <div className="text-[#2A2771]/80">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={onBackToLogin}
                    className="font-semibold text-[#2A2771] hover:underline"
                  >
                    Login
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={step === 2 || loading}
                  className={`font-semibold ${
                    step === 2 || loading
                      ? "text-[#2A2771]/40 cursor-not-allowed"
                      : "text-[#2A2771] hover:underline"
                  }`}
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
          
      
        </motion.div>
      </motion.div>
    </>
  );
}

