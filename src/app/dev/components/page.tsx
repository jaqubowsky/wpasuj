import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ComponentsDemo } from "./components-demo";

export default async function ComponentsPage() {
  await connection();
  if (process.env.DEMO_ROUTES !== "1") notFound();

  return <ComponentsDemo />;
}
