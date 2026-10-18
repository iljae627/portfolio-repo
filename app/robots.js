export default function robots() {
  const url = process.env.NEXT_PUBLIC_SITE_URL;
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    ...(url ? { sitemap: `${url}/sitemap.xml` } : {}),
  };
}
