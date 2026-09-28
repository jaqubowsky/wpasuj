import { CreatePollForm } from "@/modules/create-poll/client";
import { Landing, landingMetadata } from "@/modules/landing";
import { siteUrl } from "@/shared/site-url";
import type { Metadata } from "next";
import { connection } from "next/server";

export async function generateMetadata(): Promise<Metadata> {
  await connection();
  return landingMetadata(siteUrl());
}

export default async function HomePage() {
  await connection();
  return <Landing hero={<CreatePollForm />} home={new URL("/", siteUrl())} />;
}
