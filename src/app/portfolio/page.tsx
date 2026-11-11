import type { Metadata } from 'next';
import { SmartnetContentPage } from '@/components/smartnet/content-page';

export const metadata: Metadata = {
  title: 'Portfolio & Solutions',
  description: "Explore SmartNet's Road Funding Gap software, Watchtower DevOps platform, LMG-WMS workshop software and responsible education technology initiatives.",
  alternates: {
    canonical: '/portfolio',
  },
  openGraph: {
    title: 'Portfolio & Solutions | SmartNet Technologies',
    description: "Explore SmartNet's Road Funding Gap software, Watchtower DevOps platform, LMG-WMS workshop software and responsible education technology initiatives.",
    url: '/portfolio',
    siteName: 'SmartNet Technologies',
    type: 'website',
  },
};

export default function PortfolioPage() {
  return <SmartnetContentPage kind="portfolio" />;
}
