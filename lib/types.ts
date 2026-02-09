export type Timestamp = unknown;
export type GameStatus = "IN_PROGRESS" | "WON" | "LOST";

export type Game = {
  createdBy: string;
  player2Uid: string | null;
  word: string;
  guessedLetters: string[];
  wrongLetters: string[];
  maxWrong: number;
  status: GameStatus;
  winnerUid: string | null;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  finishedAt: Timestamp | null;
};
