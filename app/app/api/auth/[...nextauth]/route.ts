import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "aluno" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (credentials?.username === "test" && credentials?.password === "test") {
          return { id: "1", name: "Aluno Teste", email: "test@fluencyflow.com" }
        }
        if (credentials?.username === "prof" && credentials?.password === "prof") {
          return { id: "2", name: "Professor Teste", email: "jsmith@example.com" }
        }
        return null
      }
    })
  ],
  session: { strategy: "jwt" as const },
  secret: process.env.AUTH_SECRET,
})

export const GET = handlers.GET
export const POST = handlers.POST