import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureAdProvider from "next-auth/providers/azure-ad";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    }),
    AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 AUTH DEBUG: authorize function called");
        console.log("🔐 AUTH DEBUG: credentials:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ AUTH DEBUG: Missing credentials");
          return null;
        }

        try {
          console.log("🔍 AUTH DEBUG: Looking for user:", credentials.email);
          const user = await db.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            console.log("❌ AUTH DEBUG: User not found:", credentials.email);
            return null;
          }

          // Pour le MVP, on utilise une vérification simple
          // En production, utilisez bcrypt pour hasher les mots de passe
          const isPasswordValid = credentials.password === "password123";

          if (!isPasswordValid) {
            console.log("❌ AUTH DEBUG: Invalid password for user:", credentials.email);
            return null;
          }

          console.log("✅ AUTH DEBUG: User authenticated successfully:", user.email);
          
          const result = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
          
          console.log("🔐 AUTH DEBUG: Returning user object:", result);
          return result;
        } catch (error) {
          console.error("❌ AUTH DEBUG: Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      console.log("🔐 JWT DEBUG: token:", token, "user:", user, "account:", account);
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("🔐 SESSION DEBUG: session:", session, "token:", token);
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      console.log("🔐 SIGNIN DEBUG: user:", user, "account:", account);
      if (account?.type === "oauth") {
        try {
          // Vérifier si l'utilisateur existe déjà
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            // Créer un nouvel utilisateur OAuth
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name || "Utilisateur OAuth",
                role: "CLIENT", // Rôle par défaut pour les nouveaux utilisateurs OAuth
                password: "", // Pas de mot de passe pour OAuth
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
          } else {
            // Utiliser l'utilisateur existant
            user.id = existingUser.id;
            user.role = existingUser.role;
          }
        } catch (error) {
          console.error("Error during OAuth sign-in:", error);
          return false;
        }
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};