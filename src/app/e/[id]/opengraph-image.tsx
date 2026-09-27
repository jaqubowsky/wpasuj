import { findPoll } from "@/modules/create-poll";
import { linkPreviewImage, linkPreviewSize } from "@/modules/view-results";
import { notFound } from "next/navigation";

export const size = linkPreviewSize;
export const contentType = "image/png";

export default async function OpengraphImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const poll = findPoll(id, new Date());
  if (!poll) notFound();
  return linkPreviewImage(poll);
}
