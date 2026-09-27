import { Text } from "@/shared/ui/text/text";
import Link from "next/link";
import { AppHeader } from "../../app-header";
import { PageFrame } from "../../page-frame";

export default function PollGone() {
  return (
    <PageFrame>
      <AppHeader />
      <main className="flex flex-col items-start gap-3 pt-6">
        <Text as="h1" variant="title">
          Tej ankiety już nie ma
        </Text>
        <Text as="p" variant="body">
          Organizator mógł ją usunąć albo jej terminy minęły dawno temu.
        </Text>
        <Link href="/" className="mt-3 inline-flex h-button items-center rounded-control bg-ink px-6 text-button font-semibold text-surface no-underline transition-transform duration-(--duration-fill) ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink motion-safe:active:scale-97">
          Zrób nową ankietę
        </Link>
      </main>
    </PageFrame>
  );
}
