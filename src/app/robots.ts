import type { MetadataRoute } from 'next'
import { siteUrl } from '@/lib/queries'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/en/admin', '/me', '/en/me', '/api'] }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
