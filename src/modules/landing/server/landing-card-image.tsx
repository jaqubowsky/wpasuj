import { productName } from "@/shared/brand";
import { accent, edge, heat, ink, muted, ogCardSize, ogFont, paper, surface, tintCoral } from "@/shared/og-card";
import { ImageResponse } from "next/og";
import { headline, pitch } from "../domain/pitch";

const heatRows = [
  [1, 2, 0, 3],
  [2, 4, 1, 3],
  [3, 5, 2, 4],
  [2, 5, 3, 2],
  [0, 3, 1, 1],
];

export async function landingCardImage() {
  const [display, sans500] = await Promise.all([ogFont("bricolage-grotesque-800.ttf"), ogFont("onest-500.ttf")]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "56px 72px",
        background: paper,
        color: ink,
        fontFamily: "Onest",
      }}
    >
      <div style={{ position: "absolute", top: 56, left: 72, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ display: "flex", flexWrap: "wrap", width: 34, gap: 4 }}>
          {[accent, tintCoral, tintCoral, accent].map((colour, index) => (
            <div key={index} style={{ width: 15, height: 15, borderRadius: 4, background: colour }} />
          ))}
        </div>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 34, letterSpacing: "-0.03em" }}>{productName}</div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 76, lineHeight: "80px", letterSpacing: "-0.03em" }}>
          {headline}
        </div>
        <div style={{ fontSize: 28, lineHeight: "38px", fontWeight: 500, color: muted }}>{pitch}</div>
      </div>
      <div style={{ width: 300, display: "flex", flexDirection: "column", gap: 10 }}>
        {heatRows.map((row, rowIndex) => (
          <div key={rowIndex} style={{ display: "flex", gap: 10 }}>
            {row.map((level, index) => (
              <div
                key={index}
                style={{
                  width: 67,
                  height: 67,
                  borderRadius: 14,
                  background: level ? heat[level - 1] : surface,
                  border: level ? "none" : `2px solid ${edge}`,
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>,
    {
      ...ogCardSize,
      fonts: [
        { name: "Bricolage Grotesque", data: display, weight: 800 },
        { name: "Onest", data: sans500, weight: 500 },
      ],
    },
  );
}
