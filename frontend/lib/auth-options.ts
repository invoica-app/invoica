import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.MICROSOFT_CLIENT_ID || "",
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
      tenantId: process.env.MICROSOFT_TENANT_ID || "common",
    }),
    CredentialsProvider({
      id: "guest",
      name: "Guest",
      credentials: {},
      async authorize() {
        try {
          const response = await fetch(`${API_URL}/auth/guest/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) {
            return null;
          }

          const data = await response.json();
          return {
            id: data.user.id.toString(),
            email: data.user.email,
            name: data.user.name,
            provider: "GUEST",
            accessToken: data.token,
            isGuest: true,
          };
        } catch (error) {
          console.error("Guest login error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account) return false;

      try {
        if (account.provider === "google" || account.provider === "azure-ad") {
          const response = await fetch(`${API_URL}/auth/oauth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              provider: account.provider === "google" ? "GOOGLE" : "MICROSOFT",
              providerId: account.providerAccountId,
            }),
          });

          if (!response.ok) {
            return false;
          }

          const data = await response.json();
          user.accessToken = data.token;
        }

        return true;
      } catch (error) {
        console.error("Sign in error:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.provider = account?.provider || "guest";
        token.isGuest = user.isGuest || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.accessToken = token.accessToken;
        session.user.provider = token.provider;
        session.user.isGuest = token.isGuest || false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};