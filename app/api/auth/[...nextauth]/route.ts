import NextAuth, { type User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import "dotenv/config";
import prisma from "@/lib/prisma";

const authOptions = {
    providers: [
        CredentialsProvider({
            name: "Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials): Promise<User | null> {
                if (!credentials?.username || !credentials?.password) {
                    throw new Error("Missing credentials");
                }

                const user = await prisma.user.findUnique({
                    where: { name: credentials.username },
                });

                if (!user) throw new Error("User not found");
                if (credentials.password !== user.password) {
                    throw new Error("Invalid password");
                }

                // ✅ Return shape compatible with NextAuth's User
                return {
                    id: String(user.id),
                    name: user.name,
                };
            },
        }),
    ],
    debug: true,
    pages: { signIn: "/login" },
    session: { strategy: "jwt" as const },
    callbacks: {
        async jwt({ token, user }: {token: any, user: any}) {
            if (user) {
                token.id = user.id;
                token.name = user.name;
            }
            return token;
        },
        async session({ session, token }: {session: any, token: any}) {
            if (token?.id) {
                // Ensure session.user exists
                session.user = session.user || {};
                session.user.id = token.id as string;
            }
            return session;
        },
    },
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
