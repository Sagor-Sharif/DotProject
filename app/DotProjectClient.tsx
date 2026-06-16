"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

declare global {
  interface Window {
    __dotProjectScriptLoaded?: boolean;
    __dotSupabase?: typeof supabase;
    hydrateProducts?: () => void;
    syncSupabaseData?: () => void;
    renderGrids?: () => void;
    updateAuthUI?: () => void;
    updateCartUI?: () => void;
  }
}

export default function DotProjectClient() {
  const [html, setHtml] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/dotproject-body.html")
      .then((response) => response.text())
      .then((markup) => {
        if(active) setHtml(markup);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if(!html) return;
    window.__dotSupabase = supabase;

    if(window.__dotProjectScriptLoaded) {
      window.hydrateProducts?.();
      window.syncSupabaseData?.();
      window.renderGrids?.();
      window.updateAuthUI?.();
      window.updateCartUI?.();
      return;
    }

    const script = document.createElement("script");
    script.src = "/dotproject.js";
    script.async = false;
    script.onload = () => {
      window.__dotProjectScriptLoaded = true;
      window.syncSupabaseData?.();
    };
    document.body.appendChild(script);
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
