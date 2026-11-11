import type { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

import '@/features/smartnet-nexus/nexus.css';
import { NexusHome } from '@/features/smartnet-nexus/home';

export default function HomePage() {
  return <NexusHome />;
}
