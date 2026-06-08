import type { MetadataRoute } from "next"
import { company } from "@/lib/data/company"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.siteUrl
  const routes = ["", "/bi-dados", "/health-mind", "/portfolio", "/contato"]
  return routes.map((route) => ({
    url: `${base}${route}`,
    changeFrequency: "monthly",
    priority: route === "" ? 1 : 0.8,
  }))
}
