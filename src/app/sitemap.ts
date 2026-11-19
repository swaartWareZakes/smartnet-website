import type { MetadataRoute } from 'next';
import { SOLUTIONS } from '@/lib/smartnet-content';

const SITE = 'https://smartnetsa.co.za';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE,
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${SITE}/services`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${SITE}/portfolio`,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    ...SOLUTIONS.map((solution) => ({
      url: `${SITE}/portfolio/${solution.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
    {
      url: `${SITE}/about`,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];
}
