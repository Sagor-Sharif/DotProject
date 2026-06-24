import type { ReactNode } from "react";
import "./auth.css";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return <main className="auth-page">{children}</main>;
}
