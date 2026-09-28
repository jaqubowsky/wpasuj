import { productName } from "@/shared/brand";
import { accent, heat, ink, muted, ogCardSize, ogFont, onDarkMuted, paper, surface, tints } from "@/shared/og-card";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { linkPreview, setTimePreview } from "../domain/link-preview";
import type { FinalTime } from "./results-schema";

type PreviewedPoll = Parameters<typeof linkPreview>[0] & Omit<Parameters<typeof setTimePreview>[0], "final"> & { final: FinalTime | null };

type Avatars = ReturnType<typeof linkPreview>["respondents"];

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

function AvatarRow({ avatars, more, label, onInk }: Pick<Avatars, "avatars" | "more"> & { label: string; onInk?: boolean }) {
  const avatarStyle = {
    height: avatarSize,
    borderRadius: avatarSize,
    border: `4px solid ${onInk ? ink : paper}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 600,
    color: ink,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 28, fontWeight: 600 }}>
      {avatars.length > 0 && (
        <div style={{ display: "flex" }}>
          {avatars.map(({ initial, tint }, index) => (
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
          {more > 0 && (
            <div
              style={{
                ...avatarStyle,
                padding: "0 14px",
                marginLeft: -avatarSize / 4,
                background: onInk ? paper : ink,
                color: onInk ? ink : surface,
                fontSize: 26,
              }}
            >
              +{more}
            </div>
          )}
        </div>
      )}
      {label}
    </div>
  );
}

function BottomRow({ children }: { children?: ReactElement }) {
  return (
    <div style={{ height: avatarSize, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {children ?? <div />}
      <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 800, fontSize: 32, letterSpacing: "-0.03em" }}>{productName}</div>
    </div>
  );
}

function OpenCard(poll: PreviewedPoll) {
  const { asker, title, days, hours, respondents } = linkPreview(poll);
  const titleSize = title.length > longTitle ? 64 : 84;

  return (
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
      <BottomRow>
        <AvatarRow avatars={respondents.avatars} more={respondents.more} label={respondents.answered} />
      </BottomRow>
    </div>
  );
}

function SetCard({ final, ...poll }: PreviewedPoll & { final: FinalTime }) {
  const { setBy, title, day, hours, coming } = setTimePreview({ ...poll, final });
  const long = title.length > longTitle;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        padding: "56px 72px 48px",
        background: ink,
        color: surface,
        fontFamily: "Onest",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: 52,
            padding: "0 24px",
            borderRadius: 52,
            background: paper,
            color: ink,
            fontSize: 26,
            fontWeight: 600,
          }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke={ink}
            strokeWidth="2.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
          Ustalone
        </div>
        <div style={{ display: "block", lineClamp: 1, flex: 1, fontSize: 28, fontWeight: 600, color: onDarkMuted }}>{setBy}</div>
      </div>
      <div
        style={{
          display: "block",
          lineClamp: 2,
          marginTop: 28,
          fontFamily: "Bricolage Grotesque",
          fontWeight: 800,
          fontSize: long ? 44 : 56,
          lineHeight: long ? "50px" : "62px",
          letterSpacing: "-0.03em",
        }}
      >
        {title}
      </div>
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 28, color: onDarkMuted }}>Widzimy się</div>
      <div
        style={{
          marginTop: 4,
          fontFamily: "Bricolage Grotesque",
          fontWeight: 800,
          fontSize: 76,
          lineHeight: "84px",
          letterSpacing: "-0.03em",
        }}
      >
        {day}
      </div>
      <div style={{ fontFamily: "Bricolage Grotesque", fontWeight: 700, fontSize: 60, lineHeight: "68px", color: heat[2] }}>{hours}</div>
      <div style={{ height: 32 }} />
      <BottomRow>{coming && <AvatarRow avatars={coming.avatars} more={coming.more} label={coming.label} onInk />}</BottomRow>
    </div>
  );
}

export async function linkPreviewImage(poll: PreviewedPoll) {
  const [display, display700, sans400, sans500, sans600] = await Promise.all([
    ogFont("bricolage-grotesque-800.ttf"),
    ogFont("bricolage-grotesque-700.ttf"),
    ogFont("onest-400.ttf"),
    ogFont("onest-500.ttf"),
    ogFont("onest-600.ttf"),
  ]);

  return new ImageResponse(poll.final ? <SetCard {...poll} final={poll.final} /> : <OpenCard {...poll} />, {
    ...linkPreviewSize,
    fonts: [
      { name: "Bricolage Grotesque", data: display, weight: 800 },
      { name: "Bricolage Grotesque", data: display700, weight: 700 },
      { name: "Onest", data: sans400, weight: 400 },
      { name: "Onest", data: sans500, weight: 500 },
      { name: "Onest", data: sans600, weight: 600 },
    ],
  });
}
