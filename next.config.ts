import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'v3.football.api-sports.io',
      },
      {
        protocol: 'https',
        hostname: 'cdn.sportmonks.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.sportsmole.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'www.thesportstak.com',
      },
      {
        protocol: 'https',
        hostname: 'media.wired.com',
      },
      {
        protocol: 'https',
        hostname: '**.**.**',
      },
      {
        protocol: 'https',
        hostname: '**.**',
      },
       {
        protocol: 'https',
        hostname: 'cdn.theathletic.com', 
      },
       {
        protocol: 'https',
        hostname: 'i2-prod.football.london', 
      },
      {
        protocol: 'https',
        hostname: 'media.api-sports.io',
        port: '',
        pathname: '/**',
      }
    ],
  },

  async redirects() {
    return [
      // Rule 1: Redirects all old /team/... URLs to the new /teams-list/... structure.
      {
        source: '/team/:slug*',
        destination: '/teams-list/:slug*',
        permanent: true,
      },
      
      // Rule 2: Redirects a specific broken link to the homepage.
      {
        source: '/llms.txt',
        destination: '/',
        permanent: true,
      },

      // --- NEWLY ADDED RULES FOR BROKEN NEWS LINKS ---
      {
        source: '/news/los-angeles-lakers-archive.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/news/nba-news-analysis.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/news/los-angeles-lakers-news-analysis.html',
        destination: '/',
        permanent: true,
      },
      {
        source: '/cdn-cgi/l/email-protection',
        destination: '/',
        permanent: true,
      },
      // --- END OF NEW RULES ---
    ];
  },
};

export default nextConfig;