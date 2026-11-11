import '@/styles/smartnet-site.css';
import { SiteChrome } from '@/components/smartnet/site-chrome';

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SiteChrome>{children}</SiteChrome>;
}
