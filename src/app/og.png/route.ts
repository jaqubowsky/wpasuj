import { landingCardImage } from "@/modules/landing";

export const dynamic = "force-static";

export function GET() {
  return landingCardImage();
}
