import fs from "node:fs";
import path from "node:path";
import Script from "next/script";

export default function Page() {
  const bodyPath = path.join(process.cwd(), "public", "dotproject-body.html");
  const bodyMarkup = fs.readFileSync(bodyPath, "utf8");

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: bodyMarkup }} />
      <Script src="/dotproject.js" strategy="afterInteractive" />
    </>
  );
}
