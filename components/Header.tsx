"use client";

import Link from "next/link";
import { Menu } from "lucide-react";

import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { user, loading, signIn, signOutUser } = useAuth();

  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-3">
        <Link
          href="/"
          className="text-sm font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
        >
          Jogo da Forca
        </Link>

        <nav className="flex items-center gap-3">
          {loading ? (
            <Button variant="outline" size="sm" disabled>
              Carregando...
            </Button>
          ) : user ? (
            <>
              <Button asChild size="sm">
                <Link href="/create">Criar partida</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-2" />
                    {user.displayName ?? user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/friends">Lista de amigos</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOutUser()}>
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button size="sm" onClick={() => signIn()}>
              Entrar com Google
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
};
