import { NextAuthOptions } from "next-auth";
import { db } from "./db";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureAdProvider from "next-auth/providers/azure-ad";

// Détection d'environnement
const isDevelopment = process.env.NODE_ENV === "development";
const isPreview = 
  process.env.VERCEL_ENV === "preview" || 
  process.env.NODE_ENV === "preview";

// Comptes de démonstration pour le développement
const demoAccounts = {
  client: {
    id: "demo-client",
    email: "client@exemple.com",
    name: "Client Démo",
    role: "CLIENT",
    password: "password123"
  },
  agent: {
    id: "demo-agent", 
    email: "agent@exemple.com",
    name: "Agent Démo",
    role: "AGENT",
    password: "password123"
  },
  admin: {
    id: "demo-admin",
    email: "admin@exemple.com", 
    name: "Admin Démo",
    role: "ADMIN",
    password: "password123"
  }
};

export const authOptions: NextAuthOptions = {
  providers: [
    // Providers OAuth (configurés en production)
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

    // Provider Credentials adaptatif
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        console.log("🔐 AUTH DEBUG: authorize function called");
        console.log("🔐 AUTH DEBUG: environment:", { isDevelopment, isPreview });
        console.log("🔐 AUTH DEBUG: credentials:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("❌ AUTH DEBUG: Missing credentials");
          return null;
        }

        try {
          // Mode développement/preview : utiliser les comptes démo
          if (isDevelopment || isPreview) {
            console.log("🚀 DEV/PREVIEW MODE: Checking demo accounts");
            
            for (const [key, account] of Object.entries(demoAccounts)) {
              if (account.email === credentials.email && account.password === credentials.password) {
                console.log(`✅ AUTH DEBUG: Demo ${key} authenticated successfully`);
                return {
                  id: account.id,
                  email: account.email,
                  name: account.name,
                  role: account.role,
                };
              }
            }
            
            // En preview, accepter aussi l'utilisateur automatique
            if (isPreview && credentials.email === "preview@dev.local") {
              console.log("✅ AUTH DEBUG: Preview user authenticated");
              return {
                id: "preview-user",
                email: "preview@dev.local",
                name: "Utilisateur Preview",
                role: "CLIENT",
              };
            }
            
            console.log("❌ AUTH DEBUG: Invalid demo credentials");
            return null;
          }

          // Mode production : vérification en base de données
          console.log("🔍 AUTH DEBUG: Production mode - checking database");
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log("❌ AUTH DEBUG: User not found:", credentials.email);
            return null;
          }

          // Vérification du mot de passe (bcrypt en production)
          const bcrypt = await import('bcryptjs');
          let isPasswordValid = false;
          
          if (user.password) {
            isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          } else {
            // Compatibilité ancienne version
            isPasswordValid = credentials.password === "password123";
          }

          if (!isPasswordValid) {
            console.log("❌ AUTH DEBUG: Invalid password for user:", credentials.email);
            return null;
          }

          console.log("✅ AUTH DEBUG: User authenticated successfully:", user.email);
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
          
        } catch (error) {
          console.error("❌ AUTH DEBUG: Error during authentication:", error);
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
    async jwt({ token, user, account }) {
      console.log("🔐 JWT DEBUG: token:", token, "user:", user, "account:", account);
      
      if (user) {
        token.role = user.role;
        token.id = user.id;
        
        // Ajouter des métadonnées en développement
        if (isDevelopment || isPreview) {
          token.isDemo = true;
          token.environment = isDevelopment ? "development" : "preview";
        }
      }
      
      return token;
    },
    
    async session({ session, token }) {
      console.log("🔐 SESSION DEBUG: session:", session, "token:", token);
      
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        
        // Métadonnées de développement
        if (isDevelopment || isPreview) {
          session.user.isDemo = token.isDemo as boolean;
          session.user.environment = token.environment as string;
        }
      }
      
      return session;
    },
    
    async signIn({ user, account, profile }) {
      console.log("🔐 SIGNIN DEBUG: user:", user, "account:", account);
      
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
                password: "",
              },
            });
            user.id = newUser.id;
            user.role = newUser.role;
          } else {
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
    error: "/auth/error",
  },
  
  secret: process.env.NEXTAUTH_SECRET,
  
  // Configuration de debug pour le développement
  debug: isDevelopment,
  
  // Events pour le logging
  events: {
    signIn: ({ user, account, isNewUser }) => {
      console.log("🎉 SIGNIN EVENT:", { user: user.email, provider: account?.provider, isNewUser });
    },
    signOut: ({ session }) => {
      console.log("👋 SIGNOUT EVENT:", { user: session?.user?.email });
    },
  },
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