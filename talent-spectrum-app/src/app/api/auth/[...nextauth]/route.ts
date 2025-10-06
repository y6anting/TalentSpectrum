import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
// import { PrismaAdapter } from "@next-auth/prisma-adapter"; // Commented out for dashboard development
// import { PrismaClient } from "@prisma/client"; // Commented out for dashboard development
import bcrypt from "bcryptjs";

// const prisma = new PrismaClient(); // Commented out for dashboard development

const handler = NextAuth({
  // adapter: PrismaAdapter(prisma), // Commented out for dashboard development
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        userType: { label: "User Type", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // TEMPORARY: Mock user authentication for dashboard development
        // Comment out Prisma logic and return mock user
        // const user = await prisma.user.findUnique({
        //   where: {
        //     email: credentials.email,
        //   },
        // });

        // if (!user) {
        //   return null;
        // }

        // // For users created via Google OAuth, they won't have a password
        // if (!user.password) {
        //   return null;
        // }

        // const isPasswordValid = await bcrypt.compare(
        //   credentials.password,
        //   user.password
        // );

        // if (!isPasswordValid) {
        //   return null;
        // }

        // Mock user for development - any email/password combo will work
        // TESTING: Change this line to switch roles easily
        // const role = "CANDIDATE"; // Change to "EMPLOYER" or "CANDIDATE" to test employer dashboard
        const role = credentials.userType === "employer" ? "EMPLOYER" : "CANDIDATE";
        return {
          id: "mock-user-id",
          email: credentials.email || "",
          name: "Mock User",
          role: role,
          image: undefined,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && token.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as "CANDIDATE" | "EMPLOYER";
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // TEMPORARY: Comment out Prisma logic for dashboard development
      // if (account?.provider === "google") {
      //   try {
      //     const existingUser = await prisma.user.findUnique({
      //       where: { email: user.email! },
      //     });

      //     if (!existingUser) {
      //       // Create new user with default role
      //       await prisma.user.create({
      //         data: {
      //           email: user.email!,
      //           name: user.name,
      //           image: user.image,
      //           role: "CANDIDATE", // Default role, can be changed later
      //         },
      //       });
      //     }
      //   } catch (error) {
      //     console.error("Error creating user:", error);
      //     return false;
      //   }
      // }
      
      // Allow all sign-ins for development
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
