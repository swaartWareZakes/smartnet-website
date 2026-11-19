import type { Metadata } from 'next';
import { ContactPageClient } from '@/components/smartnet/contact-page-client';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Connect with SmartNet Technologies in South Africa or globally for custom software engineering, Azure cloud, DevOps, Road Funding Gap demos, and Kairo Studio early access.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contact | SmartNet Technologies',
    description:
      'Connect with SmartNet Technologies for software engineering, cloud infrastructure, DevOps, and AI consulting.',
    url: '/contact',
    siteName: 'SmartNet Technologies',
    type: 'website',
  },
};

export default function ContactPage() {
  return <ContactPageClient />;
}
