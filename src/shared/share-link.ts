type Message = { text: string; link: string };

export async function shareOrCopy({ text, link }: Message) {
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
    }
  }
  try {
    await navigator.clipboard.writeText(link);
    return "copied";
  } catch {
    return "not-copied";
  }
}
