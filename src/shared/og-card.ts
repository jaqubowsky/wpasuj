import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { Tint } from "./tint";

export const ogCardSize = { width: 1200, height: 630 };

export const paper = "#FBF7F1";
export const surface = "#FFFFFF";
export const ink = "#1E1B18";
export const muted = "#72695F";
export const edge = "#958A7E";
export const accent = "#F0603F";
export const tintCoral = "#FAD3C3";
export const tints: Record<Tint, string> = { coral: tintCoral, lilac: "#E6E1F8", mint: "#DDEFE3", butter: "#FBEBC4", sky: "#DCEBF7" };
export const heat = ["#FDEDE6", "#FAD3C3", "#F6AE93", "#F18463", "#CC4420"];

export function ogFont(file: string) {
  return readFile(join(process.cwd(), "src/shared/fonts", file));
}
