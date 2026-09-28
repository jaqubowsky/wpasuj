import { Text } from "@/shared/ui/text/text";
import Link from "next/link";

export function PollGone() {
  return (
    <div className="grid justify-items-start gap-3">
      <Text as="h2" variant="heading">
        Tej ankiety już nie ma
      </Text>
      <Text as="p" variant="body">
        Organizator mógł ją usunąć albo jej terminy minęły dawno temu.
      </Text>
      <Link href="/" className="box-border inline-flex h-13 items-center rounded-control bg-ink px-6 font-sans text-base font-semibold normal-nums text-surface no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
        Zrób nową ankietę
      </Link>
    </div>
  );
}
