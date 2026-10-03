import type { MetadataRoute } from 'next'
import { getPublicEvents, getPublishedNews, siteUrl } from '@/lib/queries'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const [news, events] = await Promise.all([getPublishedNews(), getPublicEvents()])

  const staticPaths = ['', '/news', '/events', '/about', '/join']
  const entries: MetadataRoute.Sitemap = []

  for (const p of staticPaths) {
    entries.push({ url: `${base}${p || '/'}`, changeFrequency: 'weekly', priority: p ? 0.7 : 1 })
    entries.push({ url: `${base}/en${p}`, changeFrequency: 'weekly', priority: 0.5 })
  }
  for (const n of news) {
    entries.push({ url: `${base}/news/${n.slug}`, lastModified: n.updated_at })
    entries.push({ url: `${base}/en/news/${n.slug}`, lastModified: n.updated_at })
  }
  for (const e of events) {
    entries.push({ url: `${base}/events/${e.slug}`, lastModified: e.updated_at })
    entries.push({ url: `${base}/en/events/${e.slug}`, lastModified: e.updated_at })
  }
  return entries
}
