import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Amortix — Turn Debt Into a Deadline',
    short_name: 'Amortix',
    description: 'AI-powered loan management platform that helps you make smarter decisions about loans.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/Amortix.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/Amortix.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
