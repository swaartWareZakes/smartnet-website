import type { Metadata } from 'next';
import { SmartnetContentPage } from '@/components/smartnet/content-page';

export const metadata: Metadata = {
  title: 'Services',
  description: 'Custom software development, Azure cloud engineering, Kubernetes, DevOps, security, architecture and digital transformation services from SmartNet Technologies.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Services | SmartNet Technologies',
    description: 'Custom software development, Azure cloud engineering, Kubernetes, DevOps, security, architecture and digital transformation services from SmartNet Technologies.',
    url: '/services',
    siteName: 'SmartNet Technologies',
    type: 'website',
  },
};

export default function ServicesPage() {
  return <SmartnetContentPage kind="services" />;
}
