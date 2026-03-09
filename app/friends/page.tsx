"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";
import { getDbClient } from "@/lib/firebase-client";
import type { Friend } from "@/lib/types";

export default function FriendsPage() {
  const { user, loading } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoadingFriends(false);
      return;
    }

    const db = getDbClient();
    if (!db) {
      setLoadingFriends(false);
      return;
    }

    const unsubscribe = db
      .collection("users")
      .doc(user.uid)
      .collection("friends")
      .orderBy("addedAt", "desc")
      .onSnapshot(
        (snapshot) => {
          const list: Friend[] = snapshot.docs.map((doc) => doc.data() as Friend);
          setFriends(list);
          setLoadingFriends(false);
        },
        (err) => {
          console.error("Erro ao carregar amigos:", err);
          setLoadingFriends(false);
        },
      );

    return () => unsubscribe();
  }, [user]);

  if (!loading && !user) {
    return (
      <div className="min-h-screen bg-background">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
          <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
            ← Voltar
          </Link>
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-foreground">
              Faça login para continuar
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Você precisa estar autenticado para ver sua lista de amigos.
            </p>
            <div className="mt-6">
              <AuthButton />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/">
          ← Voltar
        </Link>

        <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-foreground">
            Lista de amigos
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pessoas com quem você já jogou.
          </p>

          {loadingFriends ? (
            <p className="mt-6 text-sm text-muted-foreground">Carregando...</p>
          ) : friends.length === 0 ? (
            <p className="mt-6 text-sm text-muted-foreground">
              Você ainda não jogou com ninguém. Crie uma partida e compartilhe o link!
            </p>
          ) : (
            <ul className="mt-6 divide-y divide-border">
              {friends.map((friend) => (
                <li
                  key={friend.uid}
                  className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
                    {(friend.name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {friend.name ?? "Sem nome"}
                    </span>
                    {friend.email ? (
                      <span className="text-xs text-muted-foreground">
                        {friend.email}
                      </span>
                    ) : null}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
