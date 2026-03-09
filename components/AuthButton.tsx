"use client";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";

export const AuthButton = () => {
  const { user, loading, signIn, signOutUser } = useAuth();

  if (loading) {
    return (
      <Button variant="outline" disabled>
        Carregando...
      </Button>
    );
  }

  if (user) {
    return (
      <Button variant="outline" onClick={() => signOutUser()}>
        Sair ({user.displayName ?? user.email})
      </Button>
    );
  }

  return (
    <Button onClick={() => signIn()}>
      Entrar com Google
    </Button>
  );
};
