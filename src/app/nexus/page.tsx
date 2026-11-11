import '@/features/smartnet-nexus/nexus.css';
import { NexusHome } from '@/features/smartnet-nexus/home';

export const metadata = {
  title: 'NEXUS Experience',
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function NexusPage() {
  return <NexusHome />;
}
