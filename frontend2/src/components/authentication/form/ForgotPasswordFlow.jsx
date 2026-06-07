
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Shared UI tokens
const INDIGO = "#3D418A";
const INDIGO_DARK = "#2A2771";
const MINT = "#26B291";

const inputBase =
  "w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 " +
  "text-gray-900 placeholder-gray-400 shadow-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[#3D418A] focus:border-transparent transition";

const labelBase =
  "text-sm font-semibold text-[#3D418A] mb-1.5 flex items-center gap-1.5";

const cardCls =
  "w-full max-w-md rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-6 shadow-xl";

const variants = {
  initial: (dir) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  animate: { x: 0, opacity: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:   (dir) => ({ x: dir > 0 ? -40 : 40, opacity: 0, transition: { duration: 0.25, ease: "easeIn" } }),
};

export default function ForgotPasswordFlow({
  onSendOtp,         // async (email) => { /* send OTP */ }
  onVerifyOtp,       // async ({ email, otp }) => { /* verify */ }
  onResetPassword,   // async ({ email, otp, newPassword }) => { /* reset */ }
  onBackToLogin,     // () => { /* navigate to login */ }
  defaultEmail = "",
}) {
  const [step, setStep] = useState(0); // 0=email, 1=otp, 2=reset
  const [dir, setDir] = useState(1);

  const [email, setEmail] = useState(defaultEmail);
  const [otp, setOtp] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: "", text: "" });

  // OTP timer (15 minutes = 900 seconds)
  const OTP_WINDOW_SECS = 15 * 60;
  const [secsLeft, setSecsLeft] = useState(OTP_WINDOW_SECS);
  const timerRef = useRef(null);

  const mmss = useMemo(() => {
    const m = Math.floor(secsLeft / 60).toString().padStart(2, "0");
    const s = (secsLeft % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }, [secsLeft]);

  // Start/stop OTP timer when step changes to OTP step
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
    setMsg({ type: "", text: "" });
  };

  // Actions
  const handleSendOtp = async () => {
    setMsg({ type: "", text: "" });
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      setMsg({ type: "error", text: "Please enter a valid email." });
      return;
    }
    setLoading(true);
    try {
      if (onSendOtp) await onSendOtp(email);
      setMsg({ type: "success", text: "OTP sent to your email. It expires in 15 minutes." });
      go(1);
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "Failed to send OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setMsg({ type: "", text: "" });
    if (!otp || otp.length < 4) {
      setMsg({ type: "error", text: "Please enter the OTP code." });
      return;
    }
    if (secsLeft === 0) {
      setMsg({ type: "error", text: "OTP expired. Please resend a new code." });
      return;
    }
    setLoading(true);
    try {
      if (onVerifyOtp) await onVerifyOtp({ email, otp });
      setMsg({ type: "success", text: "OTP verified. You can now set a new password." });
      go(2);
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "Invalid OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setMsg({ type: "", text: "" });
    setLoading(true);
    try {
      if (onSendOtp) await onSendOtp(email);
      setMsg({ type: "success", text: "A new OTP has been sent. Timer reset to 15 minutes." });
      // reset timer
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
      setMsg({ type: "error", text: e?.message || "Failed to resend OTP." });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
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
      if (onResetPassword) await onResetPassword({ email, otp, newPassword: newPwd });
      setMsg({ type: "success", text: "Password updated successfully. You can log in now." });
      // optionally route back to login after a short delay
      setTimeout(() => {
        onBackToLogin?.();
      }, 800);
    } catch (e) {
      setMsg({ type: "error", text: e?.message || "Failed to update password." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex items-start justify-center">
      <div className={cardCls}>
        <div className="mb-4">
          <h3 className="text-2xl font-bold text-[#3D418A]">Forgot Password</h3>
          <p className="text-[#3D418A]/70 text-sm">Reset your password in three quick steps.</p>
        </div>

        {msg.text ? (
          <div
            className={`mb-3 text-sm rounded-lg px-3 py-2 ${
              msg.type === "error"
                ? "bg-red-50 text-red-700 border border-red-200"
                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
            }`}
          >
            {msg.text}
          </div>
        ) : null}

        <AnimatePresence custom={dir} mode="wait">
          {step === 0 && (
            <motion.div
              key="step-email"
              custom={dir}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-3"
            >
              <label className={labelBase}>📧 Email</label>
              <input
                type="email"
                className={inputBase}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className={`w-full rounded-xl bg-[${INDIGO}] text-white font-semibold py-2.5 hover:bg-[#343782] transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <div className="text-sm text-[#3D418A]/70">
                Remembered your password?{" "}
                <button type="button" onClick={onBackToLogin} className="font-semibold text-[#3D418A] hover:underline">
                  Log in
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div
              key="step-otp"
              custom={dir}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-3"
            >
              <p className="text-sm text-[#3D418A]/80">
                We sent a 6‑digit code to <span className="font-semibold text-[#3D418A]">{email}</span>.
              </p>

              <label className={labelBase}>🔑 Enter OTP</label>
              <input
                inputMode="numeric"
                pattern="\d*"
                maxLength={6}
                className={inputBase}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              />

              <div className="flex items-center justify-between text-sm">
                <span className="text-[#3D418A]/70">Expires in: <span className="font-semibold">{mmss}</span></span>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={loading}
                  className="font-semibold text-[#26B291] hover:opacity-80"
                >
                  Resend OTP
                </button>
              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading || !otp}
                className={`w-full rounded-xl bg-[${INDIGO}] text-white font-semibold py-2.5 hover:bg-[#343782] transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={() => go(0)}
                className="text-sm text-[#3D418A]/70 hover:underline"
              >
                ← Change email
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-reset"
              custom={dir}
              variants={variants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="space-y-3"
            >
              <label className={labelBase}>👤 Login (Email)</label>
              <input
                type="email"
                className={inputBase}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />

              <label className={labelBase}>🔒 New Password</label>
              <input
                type="password"
                className={inputBase}
                placeholder="At least 8 characters"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                autoComplete="new-password"
              />

              <label className={labelBase}>🔒 Confirm New Password</label>
              <input
                type="password"
                className={inputBase}
                placeholder="Retype password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                autoComplete="new-password"
              />

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading}
                className={`w-full rounded-xl bg-[${INDIGO}] text-white font-semibold py-2.5 hover:bg-[#343782] transition ${
                  loading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>

              <div className="text-sm text-[#3D418A]/70">
                Done?{" "}
                <button type="button" onClick={onBackToLogin} className="font-semibold text-[#3D418A] hover:underline">
                  Log in
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
