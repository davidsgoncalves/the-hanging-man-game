"use client";

import Link from "next/link";

import { AuthButton } from "@/components/AuthButton";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-50">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
            Jogo da Forca
          </p>
          <h1 className="text-4xl font-semibold text-zinc-900">
            Crie uma partida e compartilhe o link com um amigo.
          </h1>
          <p className="text-lg text-zinc-600">
            Jogador 1 define a palavra e envia o link. Jogador 2 entra com
            Google, joga no navegador e salva o resultado.
          </p>
        </header>

        <section className="flex flex-col gap-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-zinc-900">Entrar</h2>
            <p className="text-sm text-zinc-500">
              Use sua conta Google para iniciar. O link de cada partida é
              privado para quem receber.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <AuthButton />
            {user ? (
              <Link
                className="rounded-full bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-800"
                href="/create"
              >
                Criar partida
              </Link>
            ) : (
              <span className="text-sm text-zinc-400">
                Faça login para criar uma partida.
              </span>
            )}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: "1. Criar partida",
              description:
                "Defina a palavra secreta e gere um link público.",
            },
            {
              title: "2. Compartilhar",
              description:
                "Envie o link ao Jogador 2, que jogará em tempo real.",
            },
            {
              title: "3. Salvar resultado",
              description:
                "Ao final, o resultado é salvo no Firestore.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <h3 className="text-lg font-semibold text-zinc-900">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-500">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
