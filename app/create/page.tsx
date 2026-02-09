"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";
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
        player2Uid: null,
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
      <div className="min-h-screen bg-zinc-50">
        <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
          <Link className="text-sm text-zinc-500 hover:text-zinc-700" href="/">
            ← Voltar
          </Link>
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <h1 className="text-2xl font-semibold text-zinc-900">
              Faça login para continuar
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
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
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-16">
        <Link className="text-sm text-zinc-500 hover:text-zinc-700" href="/">
          ← Voltar
        </Link>
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-zinc-900">
            Criar partida
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Digite a palavra secreta. Ela será salva no Firestore.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleCreate}>
            <input
              className="rounded-2xl border border-zinc-200 px-4 py-3 text-lg outline-none focus:border-zinc-400"
              placeholder="PALAVRA (A-Z)"
              value={word}
              onChange={(event) => setWord(event.target.value)}
            />
            {error ? <p className="text-sm text-rose-500">{error}</p> : null}
            <button
              className="rounded-full bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={creating}
            >
              {creating ? "Criando..." : "Criar partida"}
            </button>
          </form>

          {gameId ? (
            <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="text-sm font-medium text-zinc-700">
                Link da partida
              </p>
              <p className="mt-2 break-all text-sm text-zinc-600">
                {`${typeof window !== "undefined" ? window.location.origin : ""}/game/${gameId}`}
              </p>
              <Link
                className="mt-4 inline-flex rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                href={`/game/${gameId}`}
              >
                Abrir partida
              </Link>
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
