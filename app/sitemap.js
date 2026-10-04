import { projects } from "@/lib/projects";
export default function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [
    "/",
    "/archive",
    "/sources",
    ...projects.map((p) => `/work/${p.slug}`),
  ].map((path) => ({
    url: `${base}${path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
