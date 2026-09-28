import { findPoll } from "@/modules/create-poll";
import { linkPreviewImage, linkPreviewSize, linkPreviewVersion, readResults } from "@/modules/view-results";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateImageMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = findPoll(id, new Date());

  return poll ? [{ id: linkPreviewVersion(poll.final), size: linkPreviewSize, contentType: "image/png" }] : [];
}

export default async function OpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const now = new Date();
  const poll = findPoll(id, now);

  if (!poll) notFound();

  return linkPreviewImage({ ...poll, respondents: readResults(id, poll, now).respondents });
}
