"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function ResetPasswordClient() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function validateSession() {
      if(!supabase) {
        setError("Supabase is not configured for this website.");
        return;
      }

      const { data, error: sessionError } = await supabase.auth.getSession();
      if(!active) return;

      if(sessionError || !data.session) {
        setError(sessionError?.message || "Your password recovery session is missing or expired.");
        return;
      }

      setReady(true);
    }

    validateSession();
    return () => {
      active = false;
    };
  }, []);

  async function updatePassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(!supabase || saving) return;

    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") || "");
    const confirmation = String(form.get("confirmation") || "");

    if(password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if(password !== confirmation) {
      setError("The passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if(updateError) {
      setError(updateError.message);
      return;
    }

    router.replace("/auth/result?status=password-updated");
  }

  return (
    <section className="auth-panel" aria-live="polite">
      <Link className="auth-brand" href="/">
        <span className="auth-brand-mark" />
        DotProject
      </Link>
      <p className="auth-eyebrow">Account security</p>
      <h1>Choose a new password</h1>
      <p className="auth-copy">
        Use a strong password that you have not used for another account.
      </p>

      {!ready && !error && (
        <div className="auth-status">
          <span className="auth-spinner" aria-hidden="true" />
          <span>Validating your recovery session...</span>
        </div>
      )}

      {error && <div className="auth-status error">{error}</div>}

      {ready && (
        <form className="auth-form" onSubmit={updatePassword}>
          <div className="auth-field">
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              name="password"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="auth-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              name="confirmation"
              type="password"
              minLength={8}
              autoComplete="new-password"
              required
            />
          </div>
          <div className="auth-actions">
            <button className="auth-button" type="submit" disabled={saving}>
              {saving ? "Updating..." : "Update password"}
            </button>
            <Link className="auth-button secondary" href="/">Cancel</Link>
          </div>
        </form>
      )}

      {!ready && error && (
        <div className="auth-actions">
          <Link className="auth-button" href="/">Request another reset email</Link>
        </div>
      )}
    </section>
  );
}
