import type { Metadata } from 'next';
import { SmartnetContentPage } from '@/components/smartnet/content-page';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Discover SmartNet Technologies, our South African engineering background, leadership, security-first approach and technology experience dating to 2016.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us | SmartNet Technologies',
    description: 'Discover SmartNet Technologies, our South African engineering background, leadership, security-first approach and technology experience dating to 2016.',
    url: '/about',
    siteName: 'SmartNet Technologies',
    type: 'website',
  },
};

export default function AboutPage() {
  return <SmartnetContentPage kind="about" />;
}
