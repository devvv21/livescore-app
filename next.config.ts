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
      // --- Existing Rules ---
      {
        source: '/team/:slug*',
        destination: '/teams-list/:slug*',
        permanent: true,
      },
      {
        source: '/llms.txt',
        destination: '/',
        permanent: true,
      },
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
      
      // --- Specific Rules for 404s ---
      {
        // Covers:
        // https://www.todaylivescores.com/cdn-cgi/l/email-protection
        // https://todaylivescores.com/cdn-cgi/l/email-protection
        source: '/cdn-cgi/l/email-protection',
        destination: '/',
        permanent: true,
      },
      {
        // Covers:
        // https://todaylivescores.com/blog/tag/wbc%20welterweight%20champion%202025
        source: '/blog/tag/wbc%20welterweight%20champion%202025',
        destination: '/',
        permanent: true,
      },
      {
        // Covers:
        // https://www.todaylivescores.com/blog/tag/premier%20soccer%20league
        source: '/blog/tag/premier%20soccer%20league',
        destination: '/',
        permanent: true,
      },
      {
        // Covers:
        // https://todaylivescores.com/blog/tag/sports%202025
        source: '/blog/tag/sports%202025',
        destination: '/',
        permanent: true,
      },
       {
        // Covers:
        // https://www.todaylivescores.com/blog/tag/rugby%20union
        source: '/blog/tag/rugby%20union',
        destination: '/',
        permanent: true,
      },
      {
        // Covers:
        // https://todaylivescores.com/blog/tag/rugby%20union
        source: '/blog/tag/rugby%20union',
        destination: '/',
        permanent: true,
      },
      {
        // Covers:
        // https://todaylivescores.com/blog/tag/premier%20league%20summer%20series
        source: '/blog/tag/premier%20league%20summer%20series',
        destination: '/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;