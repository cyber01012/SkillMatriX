
// components/form/LoginForm.js
"use client";
import { useEffect, useState } from "react";
import SmartInput, { MailIcon, LockIcon } from "../ui/SmartInput.jsx";

export default function LoginForm({
  appLogoSrc = "/favicon.ico",
  appName = "SkillmatriX",
  onSubmit,                // ✅ now accepted
  onSwitch,                // go to signup
  onForgot,
 
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const r = localStorage.getItem("auth:remember");
      const em = localStorage.getItem("auth:email");
      if (r === "1" && em) {
        setRemember(true);
        setEmail(em);
      }
    } catch {}
  }, []);


  useEffect(() => {
  if (error) setError("");
}, [email, password]);

function handleEmailChange(e) {
  setEmail(e.target.value);
  if (error) setError("");
}

function handlePasswordChange(e) {
  setPassword(e.target.value);
  if (error) setError("");
}

  async function handleSubmit(e) {
    e.preventDefault();               // ✅ important
    console.log("[LoginForm] submit START");
    setError("");

    if (password.length < 6) {
      console.log("[LoginForm] short password branch");
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      
    console.log("[LoginForm] before await onSubmit", { email });

      if (remember) {
        localStorage.setItem("auth:remember", "1");
        localStorage.setItem("auth:email", email);
      } else {
        localStorage.removeItem("auth:remember");
        localStorage.removeItem("auth:email");
      }

      
// ⚠️ Remove optional chaining so we FAIL LOUD if parent didn’t pass onSubmit
    if (!onSubmit) {
      console.error("[LoginForm] onSubmit prop is MISSING!");
      throw new Error("Login handler not wired. onSubmit is undefined.");
    }

    await onSubmit({ email, password });

    console.log("[LoginForm] after await onSubmit (SUCCESS)");


      // ✅ call parent API
      // await onSubmit?.({ email, password });
      // success navigation handled in AuthLayout (setMode("Home"))
    } 
    // catch (err) {
    //   setError(err?.message || "Login failed. Please try again.");
    // } 
    

catch (err) {
    console.log("[LoginForm] CATCH hit with err =", err);

    const backendMsg =
      err?.response?.data?.detail ||    // Spring Boot 3 ProblemDetail
      err?.response?.data?.message ||   // If you add @ControllerAdvice later
      (err?.response?.status === 401 ? "Your email or password is incorrect" : null) ||
      err?.message ||
      "Login failed";

    console.log("[LoginForm] resolved backendMsg =", backendMsg);
    setError(backendMsg);
}

    finally {
      
    console.log("[LoginForm] FINALLY: setLoading(false)");

      setLoading(false);
    }
  }

  const emailStatus = email ? (/\S+@\S+\.\S+/.test(email) ? "valid" : "invalid") : "idle";
  const pwdStatus = password ? (password.length >= 6 ? "valid" : "invalid") : "idle";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Branding */}
      <div className="flex flex-col items-center gap-2">
        <img src={appLogoSrc} alt={`${appName} logo`} className="w-12 h-12 rounded-md object-contain" />
        <span className="text-sm font-semibold text-[#2A2771]/90">{appName}</span>
      </div>
      <h2 className="text-xl font-semibold text-[#2A2771] text-center">Sign in</h2>

      {/* Inputs */}
      <SmartInput
        id="login-email"
        label="Email"
        type="email"
        value={email}
        
  // onChange={handleEmailChange}

        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
        icon={MailIcon}
        status={emailStatus}
        message={email && !/\S+@\S+\.\S+/.test(email) ? "Please enter a valid email" : ""}
      />
      <SmartInput
        id="login-password"
        label="Password"
        type="password"
        value={password}
        
  // onChange={handlePasswordChange}

        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
        icon={LockIcon}
        status={pwdStatus}
        message={password && password.length < 6 ? "At least 6 characters" : ""}
      />

      {/* Remember + Forgot */}
      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember me
        </label>
        <button type="button" onClick={onForgot} className="text-[#2A2771] hover:underline">
          Forgot?
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className={`w-full rounded-md bg-[#2A2771] text-white py-2.5 font-medium shadow-sm hover:bg-[#241f67] ${
          loading ? "opacity-70 cursor-not-allowed" : ""
        }`}
      >
        {loading ? "Signing in..." : "Sign in"}
      </button>

    
      <div className="text-xs text-[#2A2771]/70 text-center">
        Don’t have an account?{" "}
        <button type="button" className="underline underline-offset-2" onClick={onSwitch}>
          Sign up
        </button>
      </div>
    </form>
  );
}
