"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    __dotProjectScriptLoaded?: boolean;
    hydrateProducts?: () => void;
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

    if(window.__dotProjectScriptLoaded) {
      window.hydrateProducts?.();
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
    };
    document.body.appendChild(script);
  }, [html]);

  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
