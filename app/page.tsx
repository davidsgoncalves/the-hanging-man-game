"use client";

import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16">
        <header className="flex flex-col gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Jogo da Forca
          </p>
          <h1 className="text-4xl font-semibold text-foreground">
            Crie uma partida e compartilhe o link com um amigo.
          </h1>
          <p className="text-lg text-muted-foreground">
            Jogador 1 define a palavra e envia o link. Jogador 2 entra com
            Google, joga no navegador e salva o resultado.
          </p>
        </header>

        <section className="flex flex-col gap-6 rounded-3xl border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold text-foreground">Como funciona</h2>
            <p className="text-sm text-muted-foreground">
              Use sua conta Google para iniciar. O link de cada partida é
              privado para quem receber.
            </p>
          </div>
          {!user && (
            <p className="text-sm text-muted-foreground">
              Faça login pelo botão no topo para criar uma partida.
            </p>
          )}
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
              className="rounded-2xl border border-border bg-card p-6"
            >
              <h3 className="text-lg font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
