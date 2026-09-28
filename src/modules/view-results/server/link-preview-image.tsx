import { productName } from "@/shared/brand";
import { accent, ink, muted, ogCardSize, ogFont, paper, surface, tints } from "@/shared/og-card";
import { ImageResponse } from "next/og";
import { linkPreview } from "../domain/link-preview";

type PreviewedPoll = Parameters<typeof linkPreview>[0];

export const linkPreviewSize = ogCardSize;

const avatarSize = 68;
const longTitle = 34;

const calendarIcon = "M4 6h16v14H4zM4 10h16M8 3v4M16 3v4";
const clockIcon = "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7v5l3 2";

function Icon({ path }: { path: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke={accent}
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

const avatarStyle = {
  height: avatarSize,
  borderRadius: avatarSize,
  border: `4px solid ${paper}`,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
};

export async function linkPreviewImage(poll: PreviewedPoll) {
  const { asker, title, days, hours, respondents } = linkPreview(poll);
  const titleSize = title.length > longTitle ? 64 : 84;

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
        flexDirection: "column",
        padding: "56px 72px 48px",
        background: paper,
        color: ink,
        fontFamily: "Onest",
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 600, color: muted }}>{asker}</div>
      <div
        style={{
          display: "block",
          lineClamp: 2,
          margin: "16px 0 32px",
          fontFamily: "Bricolage Grotesque",
          fontWeight: 800,
          fontSize: titleSize,
          lineHeight: `${titleSize + 4}px`,
          letterSpacing: "-0.035em",
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, fontSize: 32, lineHeight: "40px", fontWeight: 500 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
          <div style={{ display: "flex", paddingTop: 4 }}>
            <Icon path={calendarIcon} />
          </div>
          <div style={{ display: "block", lineClamp: 2, flex: 1 }}>{days}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Icon path={clockIcon} />
          {hours}
        </div>
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ height: avatarSize, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, fontWeight: 600 }}>
          {respondents.avatars.length > 0 && (
            <div style={{ display: "flex" }}>
              {respondents.avatars.map(({ initial, tint }, index) => (
                <div
                  key={index}
                  style={{
                    ...avatarStyle,
                    width: avatarSize,
                    marginLeft: index === 0 ? 0 : -avatarSize / 4,
                    background: tints[tint],
                    fontSize: 28,
                  }}
                >
                  {initial}
                </div>
              ))}
              {respondents.more > 0 && (
                <div
                  style={{ ...avatarStyle, padding: "0 14px", marginLeft: -avatarSize / 4, background: ink, color: surface, fontSize: 26 }}
                >
                  +{respondents.more}
                </div>
              )}
            </div>
          )}
          {respondents.answered}
        </div>
        <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 32, letterSpacing: "-0.03em" }}>{productName}</div>
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
