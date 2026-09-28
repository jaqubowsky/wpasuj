import { productName } from "@/shared/brand";
import { accent, edge, ink, muted, ogCardSize, ogFont, paper, surface } from "@/shared/og-card";
import { ImageResponse } from "next/og";
import { linkPreview, miniGrid } from "../domain/link-preview";

type PreviewedPoll = Parameters<typeof linkPreview>[0];

export const linkPreviewSize = ogCardSize;

const gridBox = { width: 360, height: 502 };

export async function linkPreviewImage(poll: PreviewedPoll) {
  const { asker, title, when } = linkPreview(poll);
  const { tileWidth, tileHeight, gap, radius } = miniGrid(poll.dates.length, poll.hourCount, gridBox);

  const [display, sans500, sans600] = await Promise.all([
    ogFont("bricolage-grotesque-800.ttf"),
    ogFont("onest-500.ttf"),
    ogFont("onest-600.ttf"),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 56,
        padding: "44px 72px",
        background: paper,
        color: ink,
        fontFamily: "Onest",
      }}
    >
      <div style={{ flex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
          <div style={{ fontSize: 26, fontWeight: 600, color: muted }}>{asker}</div>
          <div
            style={{
              display: "block",
              lineClamp: 2,
              margin: "20px 0 28px",
              fontFamily: "Bricolage Grotesque",
              fontWeight: 800,
              fontSize: 84,
              lineHeight: "88px",
              letterSpacing: "-0.035em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, lineHeight: "36px", fontWeight: 500 }}>{when}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginTop: 40,
              padding: "16px 28px",
              borderRadius: 999,
              background: ink,
              color: surface,
              fontSize: 26,
              fontWeight: 600,
            }}
          >
            <div style={{ width: 14, height: 14, borderRadius: 7, background: accent }} />
            Kiedy możesz?
          </div>
        </div>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 30, letterSpacing: "-0.03em" }}>{productName}</div>
      </div>
      <div style={{ width: gridBox.width, display: "flex", flexDirection: "column", gap }}>
        {Array.from({ length: poll.hourCount }, (_, row) => (
          <div key={row} style={{ display: "flex", gap }}>
            {poll.dates.map((date) => (
              <div
                key={date}
                style={{ width: tileWidth, height: tileHeight, borderRadius: radius, background: surface, border: `2px solid ${edge}` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>,
    {
      ...linkPreviewSize,
      fonts: [
        { name: "Bricolage Grotesque", data: display, weight: 800 },
        { name: "Onest", data: sans500, weight: 500 },
        { name: "Onest", data: sans600, weight: 600 },
      ],
    },
  );
}
