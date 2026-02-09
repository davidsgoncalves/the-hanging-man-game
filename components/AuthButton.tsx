"use client";

import { useAuth } from "@/components/AuthProvider";

export const AuthButton = () => {
  const { user, loading, signIn, signOutUser } = useAuth();

  if (loading) {
    return (
      <button
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-500"
        type="button"
        disabled
      >
        Carregando...
      </button>
    );
  }

  if (user) {
    return (
      <button
        className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:border-zinc-400"
        type="button"
        onClick={() => signOutUser()}
      >
        Sair ({user.displayName ?? user.email})
      </button>
    );
  }

  return (
    <button
      className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
      type="button"
      onClick={() => signIn()}
    >
      Entrar com Google
    </button>
  );
};
