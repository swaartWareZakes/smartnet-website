import type { Metadata } from 'next';
import { SmartnetContentPage } from '@/components/smartnet/content-page';

export const metadata: Metadata = {
  title: 'Portfolio & Solutions | SmartNet Technologies',
  description:
    'Explore Road Funding Gap, Watchtower, LMG-WMS and SmartNet education technology initiatives.',
};

export default function PortfolioPage() {
  return <SmartnetContentPage kind="portfolio" />;
}
