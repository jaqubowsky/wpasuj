import { notFound } from "next/navigation";
import { connection } from "next/server";

const failedOnce = new Set<string>();

export default async function ErrorDemoPage({ searchParams }: { searchParams: Promise<{ run?: string }> }) {
  await connection();
  if (process.env.DEMO_ROUTES !== "1") notFound();

  const { run = "" } = await searchParams;

  if (!failedOnce.has(run)) {
    failedOnce.add(run);
    throw new Error("Demo server error");
  }

  return <h1>Druga próba działa</h1>;
}
