import { findPoll } from "@/modules/create-poll";
import { linkPreviewImage, linkPreviewSize, readResults } from "@/modules/view-results";
import { notFound } from "next/navigation";

export const size = linkPreviewSize;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = new Date();
  const poll = findPoll(id, now);

  if (!poll) notFound();

  return linkPreviewImage({ ...poll, respondents: readResults(id, poll, now).respondents });
}
