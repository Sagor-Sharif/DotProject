"use client";

import type { EmailOtpType } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

type CallbackState = {
  message: string;
  error?: string;
};

const OTP_TYPES = new Set<EmailOtpType>([
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email"
]);

function destinationFor(flow: string) {
  if(flow === "recovery" || flow === "invite") {
    return `/auth/reset-password?flow=${encodeURIComponent(flow)}`;
  }

  const status =
    flow === "signup" ? "confirmed" :
    flow === "magiclink" || flow === "email" ? "magic-link" :
    flow === "email_change" ? "email-changed" :
    "authenticated";

  return `/auth/result?status=${encodeURIComponent(status)}`;
}

export default function AuthCallbackClient() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({
    message: "Validating your secure email link..."
  });

  useEffect(() => {
    let active = true;

    async function validateCallback() {
      if(!supabase) {
        setState({ message: "", error: "Supabase is not configured for this website." });
        return;
      }

      const url = new URL(window.location.href);
      const hash = new URLSearchParams(url.hash.replace(/^#/, ""));
      const callbackError =
        url.searchParams.get("error_description") ||
        url.searchParams.get("error") ||
        hash.get("error_description") ||
        hash.get("error");

      if(callbackError) {
        setState({ message: "", error: callbackError.replace(/\+/g, " ") });
        return;
      }

      const requestedFlow =
        url.searchParams.get("flow") ||
        url.searchParams.get("type") ||
        hash.get("type") ||
        "";
      const code = url.searchParams.get("code");
      const tokenHash = url.searchParams.get("token_hash");
      const otpType = url.searchParams.get("type") as EmailOtpType | null;

      let authError: Error | null = null;
      let session = null;

      if(code) {
        const result = await supabase.auth.exchangeCodeForSession(code);
        authError = result.error;
        session = result.data.session;
      } else if(tokenHash && otpType && OTP_TYPES.has(otpType)) {
        const result = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: otpType
        });
        authError = result.error;
        session = result.data.session;
      } else {
        const result = await supabase.auth.getSession();
        authError = result.error;
        session = result.data.session;
      }

      if(!active) return;

      if(authError) {
        setState({ message: "", error: authError.message });
        return;
      }

      if(!session) {
        setState({
          message: "",
          error: "This authentication link is invalid, expired, or has already been used."
        });
        return;
      }

      const flow =
        requestedFlow ||
        otpType ||
        (url.hash.includes("type=recovery") ? "recovery" : "authenticated");

      setState({ message: "Authentication confirmed. Taking you to the next step..." });
      router.replace(destinationFor(flow));
    }

    validateCallback().catch((error: Error) => {
      if(active) setState({ message: "", error: error.message || "Authentication failed." });
    });

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <section className="auth-panel" aria-live="polite">
      <Link className="auth-brand" href="/">
        <span className="auth-brand-mark" />
        DotProject
      </Link>
      <p className="auth-eyebrow">Secure authentication</p>
      <h1>{state.error ? "Link could not be verified" : "Checking your email link"}</h1>
      <p className="auth-copy">
        {state.error
          ? "The link could not be accepted. It may be expired or previously used."
          : "Please keep this page open while we validate the request with Supabase."}
      </p>
      <div className={`auth-status${state.error ? " error" : ""}`}>
        {!state.error && <span className="auth-spinner" aria-hidden="true" />}
        <span>{state.error || state.message}</span>
      </div>
      {state.error && (
        <div className="auth-actions">
          <Link className="auth-button" href="/#home">Return to DotProject</Link>
          <Link className="auth-button secondary" href="/#home">Request a new email</Link>
        </div>
      )}
    </section>
  );
}
