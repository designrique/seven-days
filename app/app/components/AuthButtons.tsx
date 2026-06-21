"use client";

import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthButtons() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Logado como {session.user?.email} <br />
        <button onClick={() => signOut()}>Sair</button>
      </>
    );
  }
  return (
    <>
      Não está logado <br />
      <button onClick={() => signIn()}>Entrar</button>
    </>
  );
}
