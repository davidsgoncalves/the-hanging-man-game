# Jogo da Forca (Next.js + Firebase) — Plano de Implementação

## Resumo
Construir um app Next.js (App Router + TypeScript) que permite ao Jogador 1 criar uma partida de forca, gerar um link e enviar ao Jogador 2. Ambos fazem login com Google. O Jogador 2 joga no navegador e, ao terminar (ganhar/perder), salva o resultado no Firestore. A validação dos palpites é feita no cliente (modelo simples), com 6 erros máximos.

## Escopo e objetivos
- Jogador 1 cria uma partida informando a palavra.
- O app gera um link público da partida para o Jogador 2.
- Jogador 2 entra com Google, joga e salva o resultado ao final.
- Persistir estado do jogo e resultado no Firestore.
- Sem backend customizado ou Cloud Functions (modelo simples).

## Decisões e suposições (explicitadas)
- **Autenticação:** Google (Firebase Auth, login via popup).
- **Validação de palpites:** client-side (palavra fica no Firestore, visível ao Jogador 2).
- **Máximo de erros:** 6.
- **Jogo em tempo real via Firestore (onSnapshot).**
- **Sem medidas anti-cheat/criptografia (modelo simples aceito).**

## Arquitetura e fluxo

### Páginas / Rotas

- `/`
    - Landing + login Google.
    - Se logado, botão para criar partida ou colar link.
- `/create`
    - Formulário: palavra.
    - Cria documento `games/{id}` no Firestore.
    - Exibe link compartilhável: `/game/{id}`.
- `/game/[id]`
    - Se logado:
        - Se `player2Uid` vazio e `usuario != createdBy`, atribui como jogador 2 via transação.
        - Se `player2Uid` existente e diferente do usuário, mostrar "Partida já em uso".
        - UI da forca, letras tentadas, palavra mascarada.
        - Botão "Salvar partida" quando `status = WON` ou `LOST`.
- `/results/[id]` (opcional, pode ser modal na mesma página)
    - Exibe resultado final salvo.

### Modelo de dados (Firestore)
**Collection:** `games`  
**Doc:** `games/{gameId}`  

**Campos principais:**
- `createdBy` (string, uid)
- `player2Uid` (string | null)
- `word` (string)
- `guessedLetters` (array<string>)
- `wrongLetters` (array<string>)
- `maxWrong` (number) = 6
- `status` (enum: `IN_PROGRESS` | `WON` | `LOST`)
- `winnerUid` (string | null)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)
- `finishedAt` (timestamp | null)

**Derivados (client-side):**
- `maskedWord` (computed from word + guessedLetters)
- `wrongCount` (length of wrongLetters)

### Regras do jogo (client-side)
Ao chutar letra:
1. Se já foi tentada, ignorar.
2. Se letra existir na palavra: adicionar a `guessedLetters`.
3. Se não existir: adicionar a `wrongLetters`.
- **Vitória:** todas as letras únicas da palavra foram descobertas.
- **Derrota:** `wrongLetters.length >= maxWrong`.

## Autenticação e acesso
- Firebase Auth (Google provider).
- Guardas de rota client-side:
    - Sem login: redirect para `/`.
    - Em `/game/[id]`: se for o criador, apenas assiste (somente leitura).

## Regras de segurança (Firestore)
Objetivo: evitar que usuários não relacionados editem partidas.

`games/{gameId}`:
- `read`: qualquer usuário autenticado (modelo simples).
- `create`: somente auth (Jogador 1).
- `update`:
    - Jogador 1 pode editar apenas enquanto `status == IN_PROGRESS` e sem mudar `player2Uid` (exceto se vazio).
    - Jogador 2 pode editar `guessedLetters`, `wrongLetters`, `status`, `winnerUid`, `finishedAt`.
- `delete`: somente criador.

## UI / Componentes (alto nível)
- AuthButton (login/logout)
- CreateGameForm
- HangmanBoard (desenho + palavra)
- LetterPicker
- GameStatus (ganhou/perdeu)
- SaveGameButton

## APIs / Interfaces públicas (impacto)
- Nenhuma API server-side.
- Novo schema Firestore (`games` collection).

## Plano de implementação (passo a passo)

1. **Bootstrap**
    - `npx create-next-app@latest` com App Router + TS. (Já realizado)
    - Instalar `firebase`.
    - Criar `firebase.ts` com inicialização usando variáveis `.env.local`.

2. **Auth**
    - Configurar Google provider.
    - `AuthContext` com estado do usuário + `signInWithPopup`.
    - Guardas simples de rota.

3. **Firestore**
    - Helpers para `createGame`, `joinGame`, `updateGame`.
    - Uso de `onSnapshot` para tempo real.

4. **Create Game**
    - Formulário de palavra.
    - Criar doc no Firestore com estado inicial e gerar link.

5. **Game Page**
    - Carregar doc, validar permissão.
    - Atribuir `player2Uid` se vazio.
    - Render de tabuleiro + input de letras.
    - Atualizar doc a cada palpite.
    - Botão "Salvar partida" setando `finishedAt`, `status`, `winnerUid`.

6. **Results**
    - Mostrar resultado no final (na mesma página ou rota separada).

7. **Regras Firestore**
    - Adicionar `firestore.rules` para restrições.

## Testes e cenários (manual)
- Jogador 1 cria partida e recebe link.
- Jogador 2 acessa link, vira `player2Uid`.
- Jogador 2 joga até ganhar: `status = WON`, `winnerUid = player2Uid`.
- Jogador 2 joga até perder: `status = LOST`.
- Usuário terceiro tenta acessar a partida: apenas leitura.
- Jogador 1 acessa a partida: somente leitura.
- Confirmar que `wrongLetters` limita em 6.

## Premissas e padrões
- Usaremos apenas login Google.
- Palavras sem acentos ou caracteres especiais (podemos normalizar para uppercase A-Z).
- Interface em PT-BR.
- Sem servidor dedicado ou cloud functions.
