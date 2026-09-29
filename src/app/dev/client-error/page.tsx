import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ThrowInBrowser } from "./throw-in-browser";

export default async function ClientErrorDemoPage() {
  await connection();
  if (process.env.DEMO_ROUTES !== "1") notFound();

  return <ThrowInBrowser />;
}
