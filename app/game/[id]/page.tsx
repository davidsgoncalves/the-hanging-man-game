"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";
import {
  getDbClient,
  getServerTimestamp,
} from "@/lib/firebase-client";
import { buildMaskedWord, hasWon } from "@/lib/game-utils";
import type { Game, GameStatus } from "@/lib/types";

const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function GamePage() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [game, setGame] = useState<Game | null>(null);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    const db = getDbClient();
    if (!db) {
      setError("Firebase indisponível no momento.");
      return;
    }
    const ref = db.collection("games").doc(id);
    const unsubscribe = ref.onSnapshot(
      (snapshot) => {
        if (!snapshot.exists()) {
          setError("Partida não encontrada.");
          setGame(null);
          return;
        }
        setError("");
        setGame(snapshot.data() as Game);
      },
      (err) => {
        console.error(err);
        setError("Não foi possível carregar a partida.");
      },
    );
    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (!game || !user || joining) return;
    if (game.player2Uid || game.createdBy === user.uid) return;

    setJoining(true);
    const db = getDbClient();
    if (!db) {
      setError("Firebase indisponível no momento.");
      setJoining(false);
      return;
    }
    const ref = db.collection("games").doc(id);
    db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) return;
      const data = snapshot.data() as Game;
      if (data.player2Uid || data.createdBy === user.uid) return;
      transaction.update(ref, {
        player2Uid: user.uid,
        updatedAt: getServerTimestamp(),
      });
    })
      .catch((err) => {
        console.error(err);
        setError("Não foi possível entrar na partida.");
      })
      .finally(() => setJoining(false));
  }, [game, id, joining, user]);

  const isCreator = useMemo(
    () => !!user && !!game && game.createdBy === user.uid,
    [game, user],
  );
  const isPlayer2 = useMemo(
    () => !!user && !!game && game.player2Uid === user.uid,
    [game, user],
  );
  const isThirdUser = useMemo(() => {
    if (!user || !game) return false;
    if (game.createdBy === user.uid) return false;
    if (game.player2Uid && game.player2Uid !== user.uid) return true;
    return false;
  }, [game, user]);

  const maskedWord = useMemo(() => {
    if (!game) return "";
    return buildMaskedWord(game.word, game.guessedLetters);
  }, [game]);

  const handleGuess = async (letter: string) => {
    if (!game || !user || !isPlayer2) return;
    if (game.status !== "IN_PROGRESS") return;
    const db = getDbClient();
    if (!db) {
      setError("Firebase indisponível no momento.");
      return;
    }
    const ref = db.collection("games").doc(id);
    try {
      await db.runTransaction(async (transaction) => {
        const snapshot = await transaction.get(ref);
        if (!snapshot.exists()) return;
        const data = snapshot.data() as Game;
        if (data.status !== "IN_PROGRESS") return;
        if (data.guessedLetters.includes(letter) || data.wrongLetters.includes(letter)) {
          return;
        }
        const word = data.word;
        let guessedLetters = [...data.guessedLetters];
        let wrongLetters = [...data.wrongLetters];
        if (word.includes(letter)) {
          guessedLetters = [...guessedLetters, letter];
        } else {
          wrongLetters = [...wrongLetters, letter];
        }
        let status: GameStatus = "IN_PROGRESS";
        let winnerUid: string | null = null;
        let finishedAt = null;

        if (hasWon(word, guessedLetters)) {
          status = "WON";
          winnerUid = data.player2Uid;
          finishedAt = getServerTimestamp();
        } else if (wrongLetters.length >= data.maxWrong) {
          status = "LOST";
          winnerUid = data.createdBy;
          finishedAt = getServerTimestamp();
        }

        transaction.update(ref, {
          guessedLetters,
          wrongLetters,
          status,
          winnerUid,
          finishedAt,
          updatedAt: getServerTimestamp(),
        });
      });
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar o palpite.");
    }
  };

  const handleSave = async () => {
    if (!game || !user || game.status === "IN_PROGRESS") return;
    setSaving(true);
    const db = getDbClient();
    if (!db) {
      setError("Firebase indisponível no momento.");
      setSaving(false);
      return;
    }
    const ref = db.collection("games").doc(id);
    try {
      await ref.update({
        finishedAt: game.finishedAt ?? getServerTimestamp(),
        updatedAt: getServerTimestamp(),
      });
    } catch (err) {
      console.error(err);
      setError("Não foi possível salvar o resultado.");
    } finally {
      setSaving(false);
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
              Faça login para jogar
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              Você precisa entrar com Google para acessar esta partida.
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
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link className="text-sm text-zinc-500 hover:text-zinc-700" href="/">
            ← Voltar
          </Link>
          <AuthButton />
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        {!game ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <p className="text-sm text-zinc-500">Carregando partida...</p>
          </div>
        ) : (
          <>
            {isThirdUser ? (
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-semibold text-zinc-900">
                  Partida já em uso
                </h1>
                <p className="mt-2 text-sm text-zinc-500">
                  Outro jogador já entrou nesta partida. Você pode apenas
                  acompanhar o progresso.
                </p>
              </div>
            ) : null}

            <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-zinc-500">
                    Status:{" "}
                    <span className="font-semibold text-zinc-900">
                      {game.status === "IN_PROGRESS"
                        ? "Em andamento"
                        : game.status === "WON"
                          ? "Vitória do jogador 2"
                          : "Derrota do jogador 2"}
                    </span>
                  </p>
                  <h1 className="text-3xl font-semibold tracking-wide text-zinc-900">
                    {maskedWord}
                  </h1>
                </div>

                <div className="mt-6 grid gap-4">
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Letras erradas ({game.wrongLetters.length}/{game.maxWrong})
                    </p>
                    <p className="mt-2 text-lg font-semibold text-rose-500">
                      {game.wrongLetters.join(", ") || "Nenhuma"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Letras corretas
                    </p>
                    <p className="mt-2 text-lg font-semibold text-emerald-600">
                      {game.guessedLetters.join(", ") || "Nenhuma"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
                <h2 className="text-lg font-semibold text-zinc-900">
                  Palpites
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {isCreator
                    ? "Você é o criador e só pode assistir."
                    : isPlayer2
                      ? "Escolha uma letra para jogar."
                      : "Aguardando um jogador entrar."}
                </p>

                <div className="mt-6 grid grid-cols-6 gap-2">
                  {alphabet.map((letter) => {
                    const alreadyPicked =
                      game.guessedLetters.includes(letter) ||
                      game.wrongLetters.includes(letter);
                    return (
                      <button
                        key={letter}
                        className="rounded-lg border border-zinc-200 px-2 py-2 text-sm font-semibold text-zinc-700 hover:border-zinc-400 disabled:cursor-not-allowed disabled:bg-zinc-100"
                        type="button"
                        disabled={
                          !isPlayer2 ||
                          game.status !== "IN_PROGRESS" ||
                          alreadyPicked
                        }
                        onClick={() => handleGuess(letter)}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <h2 className="text-lg font-semibold text-zinc-900">Resultado</h2>
              <p className="mt-2 text-sm text-zinc-500">
                {game.status === "IN_PROGRESS"
                  ? "Finalize a partida para salvar o resultado."
                  : game.status === "WON"
                    ? "Parabéns! Jogador 2 venceu."
                    : "O jogador 2 perdeu a rodada."}
              </p>

              {game.status !== "IN_PROGRESS" ? (
                <button
                  className="mt-6 rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Salvando..." : "Salvar resultado"}
                </button>
              ) : null}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
