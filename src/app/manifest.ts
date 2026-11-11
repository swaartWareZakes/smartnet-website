import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SmartNet Technologies',
    short_name: 'SmartNet',
    description:
      'Software, cloud, DevOps and digital engineering solutions.',
    start_url: '/',
    display: 'browser',
    background_color: '#061825',
    theme_color: '#061825',
    icons: [
      {
        src: '/icon.svg',
        type: 'image/svg+xml',
        sizes: 'any',
        purpose: 'any',
      },
    ],
  };
}
