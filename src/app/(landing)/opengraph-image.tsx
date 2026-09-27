import { landingCardImage, landingCardSize } from "@/modules/landing";

export const size = landingCardSize;
export const contentType = "image/png";

export default function OpengraphImage() {
  return landingCardImage();
}
