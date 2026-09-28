import { accent, paper, tintCoral } from "@/shared/og-card";
import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: paper }}>
      <div style={{ display: "flex", flexWrap: "wrap", width: 112, gap: 12 }}>
        {[accent, tintCoral, tintCoral, accent].map((colour, index) => (
          <div key={index} style={{ width: 50, height: 50, borderRadius: 12, background: colour }} />
        ))}
      </div>
    </div>,
    size,
  );
}
