import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureAdProvider from "next-auth/providers/azure-ad";
import bcrypt from "bcryptjs";

// Détection d'environnement
const isDevelopment = process.env.NODE_ENV === "development";
const isPreview =
  process.env.VERCEL_ENV === "preview" ||
  (process.env.NODE_ENV as string) === "preview";

// Comptes de démonstration comme fallback (si la DB est vide)
const demoAccounts = {
  client: {
    id: "demo-client",
    email: "client@exemple.com",
    name: "Client Démo",
    role: "CLIENT",
    companyId: null,
    password: "password123"
  },
  agent: {
    id: "demo-agent",
    email: "agent@exemple.com",
    name: "Agent Démo",
    role: "AGENT",
    companyId: null,
    password: "password123"
  },
  admin: {
    id: "demo-admin",
    email: "admin@exemple.com",
    name: "Admin Démo",
    role: "ADMIN",
    companyId: null,
    password: "password123"
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Providers OAuth (configurés uniquement si les env vars sont présentes)
    ...(process.env.GOOGLE_CLIENT_ID ? [GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })] : []),

    ...(process.env.GITHUB_ID ? [GitHubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
    })] : []),

    ...(process.env.AZURE_AD_CLIENT_ID ? [AzureAdProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID!,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET!,
      tenantId: process.env.AZURE_AD_TENANT_ID!,
    })] : []),

    // Provider Credentials — DB first, demo fallback
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // 1. TOUJOURS vérifier en base de données d'abord
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (user && user.password) {
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

            if (isPasswordValid) {
              // Mettre à jour lastLoginAt
              await db.user.update({
                where: { id: user.id },
                data: { lastLoginAt: new Date() },
              }).catch(() => { }); // Silently fail

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                companyId: user.companyId,
              };
            }
          }

          // 2. Fallback: comptes démo en dev/preview uniquement (si DB vide)
          if (isDevelopment || isPreview) {
            for (const [, account] of Object.entries(demoAccounts)) {
              if (account.email === credentials.email && account.password === credentials.password) {
                return {
                  id: account.id,
                  email: account.email,
                  name: account.name,
                  role: account.role,
                  companyId: account.companyId,
                };
              }
            }
          }

          return null;

        } catch (error) {
          console.error("Authentication error:", error instanceof Error ? error.message : "Unknown error");

          // En cas d'erreur DB en dev, fallback vers les comptes démo
          if (isDevelopment || isPreview) {
            for (const [, account] of Object.entries(demoAccounts)) {
              if (account.email === credentials.email && account.password === credentials.password) {
                return {
                  id: account.id,
                  email: account.email,
                  name: account.name,
                  role: account.role,
                  companyId: account.companyId,
                };
              }
            }
          }

          return null;
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: isDevelopment ? 24 * 60 * 60 : 60 * 60, // 24h en dev, 1h en prod
  },

  jwt: {
    maxAge: isDevelopment ? 24 * 60 * 60 : 60 * 60,
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.companyId = user.companyId || null;

        if (isDevelopment || isPreview) {
          token.isDemo = user.id?.startsWith('demo-') ? true : false;
          token.environment = isDevelopment ? "development" : "preview";
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.companyId = (token.companyId as string) || null;

        if (isDevelopment || isPreview) {
          (session.user as any).isDemo = token.isDemo as boolean;
          (session.user as any).environment = token.environment as string;
        }
      }

      return session;
    },

    async signIn({ user, account }) {
      // OAuth : créer ou mettre à jour l'utilisateur
      if (account?.type === "oauth") {
        try {
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          if (!existingUser) {
            const newUser = await db.user.create({
              data: {
                email: user.email!,
                name: user.name || "Utilisateur OAuth",
                role: "CLIENT",
                password: "", // Pas de mot de passe pour OAuth
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
            user.companyId = newUser.companyId;
          } else {
            user.id = existingUser.id;
            user.role = existingUser.role;
            user.companyId = existingUser.companyId;
          }
        } catch (error) {
          console.error("OAuth sign-in error:", error instanceof Error ? error.message : "Unknown error");
          return false;
        }
      }

      return true;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,

  // Debug uniquement en développement
  debug: isDevelopment,
};

// Utilitaires pour le développement
export const getDemoAccounts = () => {
  if (!isDevelopment && !isPreview) {
    return {};
  }
  return demoAccounts;
};

export const isDemoMode = () => {
  return isDevelopment || isPreview;
};

export const createPreviewUser = () => {
  if (!isPreview) return null;

  return {
    id: "preview-user",
    email: "preview@dev.local",
    name: "Utilisateur Preview",
    role: "CLIENT" as const,
  };
};