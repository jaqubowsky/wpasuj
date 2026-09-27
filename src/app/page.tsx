import { CreatePollForm } from "@/modules/create-poll/client";
import { Landing, landingMetadata } from "@/modules/landing";
import { siteUrl } from "@/shared/site-url";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return landingMetadata(await siteUrl());
}

export default async function HomePage() {
  return <Landing hero={<CreatePollForm />} home={new URL("/", await siteUrl())} />;
}
