import * as z from "zod/mini";

const viewportSide = z.int().check(z.minimum(0), z.maximum(100_000));

export const reportSchema = z.object({
  text: z.string().check(z.trim(), z.minLength(1), z.maxLength(2000)),
  contact: z.string().check(z.trim(), z.maxLength(200)),
  website: z.string(),
  path: z.string().check(z.startsWith("/"), z.maxLength(2000)),
  viewport: z.object({ width: viewportSide, height: viewportSide }),
});

export type ReportInput = z.input<typeof reportSchema>;
