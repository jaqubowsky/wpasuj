const titleLength = 80;

type Report = {
  text: string;
  contact: string;
  path: string;
  userAgent: string;
  viewport: { width: number; height: number };
  time: Date;
};

export function issueTitle(text: string) {
  return text.trim().split("\n")[0].trim().slice(0, titleLength).trim();
}

export function issueDescription({ text, contact, path, userAgent, viewport, time }: Report) {
  const pollId = path.match(/^\/e\/([^/]+)/)?.[1];

  return [
    "Filed from the in-app “Zgłoś problem” form.",
    "",
    text.trim(),
    "",
    `**Contact:** ${contact.trim() || "none"}`,
    "",
    `- Path: \`${path}\``,
    ...(pollId ? [`- Poll: \`${pollId}\``] : []),
    `- User agent: ${userAgent || "unknown"}`,
    `- Viewport: ${viewport.width}×${viewport.height}`,
    `- Time: ${time.toISOString()}`,
  ].join("\n");
}
