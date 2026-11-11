import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, Newsreader } from 'next/font/google';
import './globals.css';

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const display = Newsreader({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://smartnetsa.co.za'),
  applicationName: 'SmartNet Technologies',

  title: {
    default: 'SmartNet Technologies | Software, Cloud & Digital Solutions',
    template: '%s | SmartNet Technologies',
  },

  description:
    'South African technology company delivering custom software, cloud engineering, DevOps, cybersecurity-minded solutions, AI and digital transformation.',

  category: 'Technology',
  creator: 'SmartNet Technologies',
  publisher: 'SmartNet Technologies',

  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: 'https://smartnetsa.co.za',
    siteName: 'SmartNet Technologies',
    title: 'SmartNet Technologies | Engineering What Comes Next',
    description:
      'Software engineering, cloud, DevOps, AI and digital transformation. Built on human expertise.',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'SmartNet Technologies | Engineering What Comes Next',
    description:
      'Engineering software, cloud platforms and intelligent digital solutions from South Africa.',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
};


const organisationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': 'https://smartnetsa.co.za/#organization',
  name: 'SmartNet Technologies',
  legalName: 'SmartNet Technologies',
  url: 'https://smartnetsa.co.za',
  logo: 'https://smartnetsa.co.za/icon.svg',
  identifier: '2021/570418/07',
  description:
    'South African technology company specialising in software engineering, cloud infrastructure, DevOps, solutions architecture and digital transformation.',
  address: {
    '@type': 'PostalAddress',
    addressRegion: 'Gauteng',
    addressCountry: 'ZA',
  },
  areaServed: ['South Africa', 'International'],
  knowsAbout: [
    'Custom software engineering',
    'Microsoft Azure',
    'Kubernetes',
    'DevOps',
    'Solutions architecture',
    'Digital transformation',
    'Responsible artificial intelligence',
    'Education technology',
    'Disaster recovery planning',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-ZA" className={`${sans.variable} ${display.variable}`}>
      <body suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organisationJsonLd)
              .replace(/</g, '\\u003c'),
          }}
        />
        {children}
      </body>
    </html>
  );
}
