"use client";

// components/auth/AuthModal.tsx
// Clerk v6 method names:
//   prepareEmailAddressVerification / attemptEmailAddressVerification
//   preparePhoneNumberVerification  / attemptPhoneNumberVerification
//   prepareFirstFactor / attemptFirstFactor  (for phone login)
//   authenticateWithRedirect

import React, { useState } from "react";
import { X, Mail, Phone, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { ModalOverlay } from "@/components/ui/modal-overlay";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { FaGoogle, FaFacebook } from "react-icons/fa";

// ─── Types ────────────────────────────────────────────────────────────────────

type AuthMode    = "login" | "signup";
type InputMethod = "email" | "phone";
type Step        = "credentials" | "email-verify" | "phone-verify";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: AuthMode;
  onTypeChange?: (type: AuthMode) => void;
}

// ─── Error helper ─────────────────────────────────────────────────────────────

function clerkErrMsg(err: unknown): string {
  if (err && typeof err === "object" && "errors" in err) {
    const errors = (err as { errors: { message?: string; longMessage?: string }[] }).errors;
    return errors?.[0]?.longMessage || errors?.[0]?.message || "Something went wrong.";
  }
  if (err instanceof Error) return err.message;
  return "Something went wrong.";
}

// ─── Component ────────────────────────────────────────────────────────────────

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, type, onTypeChange }) => {

  const [inputMethod, setInputMethod] = useState<InputMethod>("email");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [password,    setPassword]    = useState("");
  const [fullName,    setFullName]    = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [otp,         setOtp]         = useState("");
  const [step,        setStep]        = useState<Step>("credentials");
  const [error,       setError]       = useState("");
  const [loading,     setLoading]     = useState(false);

  // ── Clerk hooks ───────────────────────────────────────────────────────────────
  // In Clerk v6, useSignIn returns { isLoaded, signIn, setActive }
  //              useSignUp returns { isLoaded, signUp, setActive }
  // setActive must come from the SAME hook as the flow being completed.
  // signIn.setActive is used for login completions.
  // signUp.setActive is used for signup completions.
  const { isLoaded: siLoaded, signIn, setActive: setActiveSignIn } = useSignIn();
  const { isLoaded: suLoaded, signUp, setActive: setActiveSignUp } = useSignUp();

  // ── Reset ──────────────────────────────────────────────────────────────────────
  const handleClose = () => {
    setStep("credentials"); setError(""); setOtp("");
    setEmail(""); setPhone(""); setPassword(""); setFullName("");
    onClose();
  };

  const toE164 = (raw: string) =>
    raw.startsWith("+") ? raw.trim() : `+91${raw.replace(/\D/g, "")}`;

  // ─── EMAIL SUBMIT ─────────────────────────────────────────────────────────────

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    try {
      if (type === "signup") {
        if (!suLoaded || !signUp) return;

        await signUp.create({
          emailAddress: email,
          password,
          ...(fullName && {
            firstName: fullName.split(" ")[0],
            lastName:  fullName.split(" ").slice(1).join(" ") || undefined,
          }),
        });

        //  Clerk v6 method name
        await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
        setStep("email-verify");

      } else {
        if (!siLoaded || !signIn) return;

        const result = await signIn.create({ identifier: email, password });

        if (result.status === "complete") {
          // setActive from useSignIn for login
          await setActiveSignIn({ session: result.createdSessionId });
          handleClose();
        }
      }
    } catch (err) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── EMAIL VERIFY ─────────────────────────────────────────────────────────────
  const handleEmailVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!suLoaded || !signUp) return;
    setError(""); setLoading(true);
 
    try {
      const result = await signUp.attemptEmailAddressVerification({ code: otp });
 
      // ── DEBUG: remove these two lines once working ──
      console.log("signUp.status after verify:", result.status);
      console.log("signUp.missingFields:", result.missingFields);
 
      if (result.status === "complete") {
        // Normal path: everything verified, activate the session
        await setActiveSignUp({ session: result.createdSessionId });
        handleClose();
 
      } else if (result.status === "missing_requirements") {
        // Clerk sometimes requires additional steps (e.g. phone, username).
        // missingFields tells us what's still needed.
        const missing = result.missingFields ?? [];
 
        if (missing.length === 0) {
          // No missing fields reported but status isn't complete — try completing directly
          const completed = await signUp.update({});
          if (completed.status === "complete") {
            await setActiveSignUp({ session: completed.createdSessionId });
            handleClose();
          }
        } else {
          setError(
            `Additional info required: ${missing.join(", ")}. Please check your Clerk dashboard settings.`
          );
        }
 
      } else {
        console.warn("Unexpected signUp status:", result.status);
        setError("Verification could not be completed. Please try again.");
      }
 
    } catch (err) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── PHONE SUBMIT ─────────────────────────────────────────────────────────────

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    const phoneE164 = toE164(phone);

    try {
      if (type === "signup") {
        if (!suLoaded || !signUp) return;

        await signUp.create({ phoneNumber: phoneE164 });
        // Clerk v6 method name
        await signUp.preparePhoneNumberVerification({ strategy: "phone_code" });
        setStep("phone-verify");

      } else {
        if (!siLoaded || !signIn) return;

        const attempt = await signIn.create({ identifier: phoneE164 });

        const phoneFactor = attempt.supportedFirstFactors?.find(
          (f: { strategy: string }) => f.strategy === "phone_code"
        ) as { strategy: "phone_code"; phoneNumberId: string } | undefined;

        if (!phoneFactor) {
          setError("Phone login is not enabled for this account. Use email.");
          return;
        }

        await signIn.prepareFirstFactor({
          strategy:      "phone_code",
          phoneNumberId: phoneFactor.phoneNumberId,
        });

        setStep("phone-verify");
      }
    } catch (err) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── PHONE VERIFY ─────────────────────────────────────────────────────────────

  const handlePhoneVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);

    try {
      if (type === "signup") {
        if (!suLoaded || !signUp) return;

        const result = await signUp.attemptPhoneNumberVerification({ code: otp });
        if (result.status === "complete") {
          await setActiveSignUp({ session: result.createdSessionId });
          handleClose();
        }

      } else {
        if (!siLoaded || !signIn) return;

        const result = await signIn.attemptFirstFactor({ strategy: "phone_code", code: otp });
        if (result.status === "complete") {
          await setActiveSignIn({ session: result.createdSessionId });
          handleClose();
        }
      }
    } catch (err) {
      setError(clerkErrMsg(err));
    } finally {
      setLoading(false);
    }
  };

  // ─── OAUTH ────────────────────────────────────────────────────────────────────

  const handleOAuth = async (provider: "oauth_google" | "oauth_facebook") => {
    setError("");
    try {
      if (type === "signup") {
        if (!suLoaded || !signUp) return;
        await signUp.authenticateWithRedirect({
          strategy:            provider,
          redirectUrl:         "/sso-callback",
          redirectUrlComplete: "/profile",
        });
      } else {
        if (!siLoaded || !signIn) return;
        await signIn.authenticateWithRedirect({
          strategy:            provider,
          redirectUrl:         "/sso-callback",
          redirectUrlComplete: "/",
        });
      }
    } catch (err) {
      setError(clerkErrMsg(err));
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────

  const isOTPStep = step === "email-verify" || step === "phone-verify";

  return (
    <ModalOverlay isOpen={isOpen} onClose={handleClose}>
      <div className="bg-card rounded-2xl shadow-2xl p-8 w-full border border-border">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-foreground">
              {isOTPStep ? "Verify your identity" : type === "login" ? "Welcome Back" : "Join Us"}
            </h2>
            {!isOTPStep && (
              <p className="text-sm text-muted-foreground mt-0.5">
                {type === "login" ? "Sign in to your account" : "Create your account for free"}
              </p>
            )}
          </div>
          <button onClick={handleClose} className="text-muted-foreground hover:text-foreground">
            <X size={24} />
          </button>
        </div>

        {/* OTP Screen */}
        {isOTPStep && (
          <form
            onSubmit={step === "email-verify" ? handleEmailVerify : handlePhoneVerify}
            className="space-y-5"
          >
            <button
              type="button"
              onClick={() => { setStep("credentials"); setOtp(""); setError(""); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <p className="text-sm text-muted-foreground">
              {step === "email-verify"
                ? `We sent a 6-digit code to ${email}.`
                : `We sent an OTP to +91${phone}.`}
            </p>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Verification Code
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="000000"
                autoFocus
              />
            </div>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Verifying…" : "Verify & Continue"}
            </button>
          </form>
        )}

        {/* Credentials Screen */}
        {!isOTPStep && (
          <>
            {/* Email / Phone toggle */}
            <div className="flex gap-1 p-1 bg-muted rounded-xl mb-5">
              {(["email", "phone"] as InputMethod[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => { setInputMethod(m); setError(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                    inputMethod === m
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m === "email" ? <Mail size={14} /> : <Phone size={14} />}
                  {m}
                </button>
              ))}
            </div>

            {/* Email Form */}
            {inputMethod === "email" && (
              <form onSubmit={handleEmailSubmit} className="space-y-4">
                {type === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={8}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

                {/* Required for Clerk bot protection in dev */}
                <div id="clerk-captcha" />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Please wait…" : type === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>
            )}

            {/* Phone Form */}
            {inputMethod === "phone" && (
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                {type === "signup" && (
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <span className="flex items-center px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground select-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      required
                      maxLength={10}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder="98765 43210"
                    />
                  </div>
                </div>

                {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 px-3 py-2 rounded-lg">{error}</p>}

                <div id="clerk-captcha" />

                <button
                  type="submit"
                  disabled={loading || phone.length < 10}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Sending OTP…" : "Send OTP"}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* OAuth */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuth("oauth_google")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-medium transition-colors"
              >
                <FaGoogle className="text-[#4285F4]" size={16} /> Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth("oauth_facebook")}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-background hover:bg-muted text-foreground text-sm font-medium transition-colors"
              >
                <FaFacebook className="text-[#1877F2]" size={16} /> Facebook
              </button>
            </div>

            {/* Switch mode */}
            <p className="text-center text-muted-foreground text-sm mt-5">
              {type === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => { setError(""); onTypeChange?.(type === "login" ? "signup" : "login"); }}
                className="text-primary font-medium hover:underline"
              >
                {type === "login" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </>
        )}

      </div>
    </ModalOverlay>
  );
};

export default AuthModal;