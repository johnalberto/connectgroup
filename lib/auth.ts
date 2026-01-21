import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma) as any,
    session: { strategy: "jwt" },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // 1. Find user
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string }
                });

                // 2. Check if user exists and has a password
                // (If user has no password, they likely signed up via OAuth or it's a legacy account)
                if (!user || !user.password) {
                    return null;
                }

                // 3. Verify password
                // @ts-ignore: bcryptjs might not be installed yet in environment, but this is the correct code
                const bcrypt = await import("bcryptjs");
                const isValid = await bcrypt.compare(credentials.password as string, user.password);

                if (!isValid) return null;

                return user;
            }
        })
    ],
    callbacks: {
        async session({ session, token }) {
            if (session.user && token.sub) {
                session.user.id = token.sub
            }
            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "USER" | "LEADER";
            }
            return session
        },
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        }
    },
    pages: {
        signIn: '/auth/signin',
    }
})
