import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const ogCardSize = { width: 1200, height: 630 };

export const paper = "#FBF7F1";
export const surface = "#FFFFFF";
export const ink = "#1E1B18";
export const muted = "#72695F";
export const edge = "#958A7E";
export const accent = "#F0603F";

export function ogFont(file: string) {
  return readFile(join(process.cwd(), "src/shared/fonts", file));
}
