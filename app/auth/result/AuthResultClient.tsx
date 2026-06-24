"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CONTENT: Record<string, { eyebrow: string; title: string; copy: string }> = {
  confirmed: {
    eyebrow: "Email confirmed",
    title: "Your account is ready",
    copy: "Your email address has been verified. You can now continue to your DotProject account."
  },
  "magic-link": {
    eyebrow: "Magic link accepted",
    title: "You are signed in",
    copy: "The secure email link was verified and your session is active."
  },
  "email-changed": {
    eyebrow: "Email updated",
    title: "Your email address is confirmed",
    copy: "Your account now uses the new verified email address."
  },
  "password-updated": {
    eyebrow: "Password updated",
    title: "Your new password is active",
    copy: "You can return to DotProject and continue using your account."
  },
  authenticated: {
    eyebrow: "Authentication complete",
    title: "Your session is active",
    copy: "Supabase validated the email link successfully."
  }
};

export default function AuthResultClient() {
  const [status, setStatus] = useState("authenticated");

  useEffect(() => {
    const value = new URL(window.location.href).searchParams.get("status");
    if(value) setStatus(value);
  }, []);

  const content = CONTENT[status] || CONTENT.authenticated;

  return (
    <section className="auth-panel">
      <Link className="auth-brand" href="/">
        <span className="auth-brand-mark" />
        DotProject
      </Link>
      <p className="auth-eyebrow">{content.eyebrow}</p>
      <h1>{content.title}</h1>
      <p className="auth-copy">{content.copy}</p>
      <div className="auth-status">
        <span>Supabase authentication completed successfully.</span>
      </div>
      <div className="auth-actions">
        <Link className="auth-button" href="/">Continue to DotProject</Link>
      </div>
    </section>
  );
}
