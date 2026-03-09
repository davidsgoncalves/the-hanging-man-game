"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDbClient, getServerTimestamp } from "@/lib/firebase-client";
import { normalizeWord } from "@/lib/game-utils";

export default function CreatePage() {
  const { user, loading } = useAuth();
  const [word, setWord] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [gameId, setGameId] = useState<string | null>(null);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!user) {
      setError("Faça login para criar uma partida.");
      return;
    }

    const normalized = normalizeWord(word);
    if (!normalized) {
      setError("Informe uma palavra válida (A-Z, sem acentos).");
      return;
    }

    setCreating(true);
    try {
      const db = getDbClient();
      if (!db) {
        setError("Firebase indisponível no momento.");
        return;
      }
      const docRef = await db.collection("games").add({
        createdBy: user.uid,
        createdByName: user.displayName ?? null,
        player2Uid: null,
        player2Name: null,
        participants: [user.uid],
        word: normalized,
        guessedLetters: [],
        wrongLetters: [],
        maxWrong: 6,
        status: "IN_PROGRESS",
        winnerUid: null,
        createdAt: getServerTimestamp(),
        updatedAt: getServerTimestamp(),
        finishedAt: null,
      });
      setGameId(docRef.id);
      setWord("");
    } catch (err) {
      console.error(err);
      setError("Não foi possível criar a partida. Tente novamente.");
    } finally {
      setCreating(false);
    }
  };

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
              Você precisa estar autenticado para criar uma partida.
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
            Criar partida
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Digite a palavra secreta. Ela será salva no Firestore.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreate}>
            <Input
              placeholder="PALAVRA (A-Z)"
              value={word}
              onChange={(event) => setWord(event.target.value)}
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" disabled={creating}>
              {creating ? "Criando..." : "Criar partida"}
            </Button>
          </form>

          {gameId ? (
            <div className="mt-6 rounded-2xl border border-border bg-muted p-4">
              <p className="text-sm font-medium text-foreground">
                Link da partida
              </p>
              <p className="mt-2 break-all text-sm text-muted-foreground">
                {`${typeof window !== "undefined" ? window.location.origin : ""}/game/${gameId}`}
              </p>
              <Button asChild className="mt-4">
                <Link href={`/game/${gameId}`}>Abrir partida</Link>
              </Button>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
