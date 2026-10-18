import { z } from "zod";
export const activitySchema = z
  .object({
    title: z.string().trim().min(2).max(140),
    summary: z.string().trim().min(5).max(500),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((v) => {
        const d = new Date(v);
        return !isNaN(d) && d.toISOString().slice(0, 10) === v;
      }),
    category: z.enum([
      "Development",
      "CTF & Wargame",
      "Research & Conference",
      "Bug Bounty",
      "전공 학습 & 멘토링",
    ]),
    url: z
      .string()
      .url()
      .max(2048)
      .refine((v) => {
        try {
          return new URL(v).protocol === "https:";
        } catch {
          return false;
        }
      }, "HTTPS 주소를 입력하세요."),
    tags: z.array(z.string().trim().min(1).max(40)).max(8),
  })
  .strict();
