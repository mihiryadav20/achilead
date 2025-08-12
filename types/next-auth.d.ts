import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      linkedinId?: string | null;
      headline?: string | null;
      location?: string | null;
      industry?: string | null;
      summary?: string | null;
      publicProfileUrl?: string | null;
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    linkedinId?: string | null;
    headline?: string | null;
    location?: string | null;
    industry?: string | null;
    summary?: string | null;
    publicProfileUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}
