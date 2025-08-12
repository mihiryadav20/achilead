import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
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
    async signIn({ user, account, profile }) {
      // This callback is called whenever a user signs in
      // The user will be automatically saved to the database via PrismaAdapter
      if (account?.provider === "linkedin" && profile) {
        try {
          // Update user with additional LinkedIn profile data
          await prisma.user.upsert({
            where: { email: user.email! },
            update: {
              name: user.name,
              image: user.image,
              linkedinId: profile.sub,
              headline: (profile as any).headline,
              location: (profile as any).location?.name,
              industry: (profile as any).industry,
              summary: (profile as any).summary,
              publicProfileUrl: (profile as any).publicProfileUrl,
            },
            create: {
              email: user.email!,
              name: user.name,
              image: user.image,
              linkedinId: profile.sub,
              headline: (profile as any).headline,
              location: (profile as any).location?.name,
              industry: (profile as any).industry,
              summary: (profile as any).summary,
              publicProfileUrl: (profile as any).publicProfileUrl,
            },
          });
        } catch (error) {
          console.error("Error saving user profile:", error);
          // Still allow sign in even if profile update fails
        }
      }
      return true;
    },
    async session({ session, user }) {
      // Send properties to the client
      if (session.user) {
        session.user.id = user.id;
        // Fetch additional user data from database
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            linkedinId: true,
            headline: true,
            location: true,
            industry: true,
            summary: true,
            publicProfileUrl: true,
          },
        });
        if (dbUser) {
          session.user = { ...session.user, ...dbUser };
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
