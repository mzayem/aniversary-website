import { ImageResponse } from "next/og";
import { HEART_PATH } from "./components/heartPath";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "A little surprise for Shakiba — 13 September";

// Google Fonts only serves woff2 to modern UAs; satori needs ttf/otf/woff,
// so we ask with an old UA string to get a plain truetype file back.
async function loadFraunces() {
  try {
    const cssRes = await fetch(
      "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@40,600&display=swap",
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 5.1) AppleWebKit/522.14 (KHTML, like Gecko) Version/5.0 Safari/522.14",
        },
      }
    );
    const css = await cssRes.text();
    const match = css.match(/src: url\((.+?)\) format\('truetype'\)/);
    if (!match) return null;
    const fontRes = await fetch(match[1]);
    return await fontRes.arrayBuffer();
  } catch {
    return null;
  }
}

export default async function OpengraphImage() {
  const fraunces = await loadFraunces();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#150a1d",
          backgroundImage:
            "radial-gradient(circle at 76% 18%, rgba(240,87,124,0.4), transparent 60%)",
        }}
      >
        <svg width="156" height="150" viewBox="0 0 100 96">
          <path d={HEART_PATH} fill="#f0577c" />
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 64,
            lineHeight: 1.15,
            color: "#fff6ec",
            fontFamily: fraunces ? "Fraunces" : undefined,
            fontWeight: 600,
            textAlign: "center",
            padding: "0 80px",
          }}
        >
          a little surprise for you
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            fontSize: 24,
            letterSpacing: 6,
            color: "#f0b93e",
          }}
        >
          FROM M. ZAYEM · 13 SEPTEMBER
        </div>
      </div>
    ),
    {
      ...size,
      fonts: fraunces ? [{ name: "Fraunces", data: fraunces, weight: 600 as const }] : undefined,
    }
  );
}
