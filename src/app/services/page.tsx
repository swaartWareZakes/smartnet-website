import type { Metadata } from 'next';
import { SmartnetContentPage } from '@/components/smartnet/content-page';

export const metadata: Metadata = {
  title: 'Services | SmartNet Technologies',
  description:
    'Software engineering, cloud, DevOps, solutions architecture, security, responsible AI and technology advisory.',
};

export default function ServicesPage() {
  return <SmartnetContentPage kind="services" />;
}
