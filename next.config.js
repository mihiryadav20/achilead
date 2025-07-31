/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'lh3.googleusercontent.com',  // Google profile images
      'media.licdn.com',            // LinkedIn profile images
      'platform-lookaside.fbsbx.com', // Facebook profile images
      'avatars.githubusercontent.com', // GitHub profile images
      'pbs.twimg.com',              // Twitter profile images
      'platform-lookaside.fbsbx.com' // Facebook profile images
    ],
  },
};

module.exports = nextConfig;
