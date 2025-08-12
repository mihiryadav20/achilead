import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
// import { PrismaAdapter } from "@next-auth/prisma-adapter";
// import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  // adapter: PrismaAdapter(prisma), // Temporarily disabled for testing
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: "openid profile email",
        },
      },
      issuer: "https://www.linkedin.com/oauth",
      jwks_endpoint: "https://www.linkedin.com/oauth/openid/jwks",
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          // Additional LinkedIn profile data
          linkedinId: profile.sub,
          headline: profile.headline,
          location: profile.location?.name,
          industry: profile.industry,
          summary: profile.summary,
          publicProfileUrl: profile.publicProfileUrl,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and user info to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.id = profile?.sub;
        // Store LinkedIn profile data in token for now
        if (account.provider === "linkedin" && profile) {
          token.linkedinProfile = {
            linkedinId: profile.sub,
            headline: (profile as any).headline,
            location: (profile as any).location?.name,
            industry: (profile as any).industry,
            summary: (profile as any).summary,
            publicProfileUrl: (profile as any).publicProfileUrl,
          };
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      session.accessToken = token.accessToken as string;
      if (session.user) {
        session.user.id = token.id as string;
        // Add LinkedIn profile data to session
        if (token.linkedinProfile) {
          session.user = { ...session.user, ...token.linkedinProfile };
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // Use the home page as the sign-in page
  },
});

export { handler as GET, handler as POST };
