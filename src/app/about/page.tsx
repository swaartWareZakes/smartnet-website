import type { Metadata } from 'next';
import { SmartnetContentPage } from '@/components/smartnet/content-page';

export const metadata: Metadata = {
  title: 'About | SmartNet Technologies',
  description:
    'Discover SmartNet Technologies, our engineering values, company background and delivery approach.',
};

export default function AboutPage() {
  return <SmartnetContentPage kind="about" />;
}
