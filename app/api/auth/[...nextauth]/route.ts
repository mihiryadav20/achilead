import NextAuth from "next-auth";
import LinkedInProvider from "next-auth/providers/linkedin";

const handler = NextAuth({
  providers: [
    LinkedInProvider({
      clientId: process.env.LINKEDIN_CLIENT_ID as string,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET as string,
      // Using the simplest configuration possible
      profile(profile) {
        return {
          id: profile.sub || profile.id,
          name: profile.name || `${profile.given_name || ''} ${profile.family_name || ''}`.trim(),
          email: profile.email,
          image: profile.picture,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        // Use type assertion to inform TypeScript about the custom profile structure
        token.id = (profile as any)?.id || profile?.sub;
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user id from a provider.
      session.accessToken = token.accessToken as string;
      session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/", // Use the home page as the sign-in page
  },
});

export { handler as GET, handler as POST };
