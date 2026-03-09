export type Timestamp = unknown;
export type GameStatus = "IN_PROGRESS" | "WON" | "LOST";

export type Game = {
  createdBy: string;
  createdByName: string | null;
  player2Uid: string | null;
  player2Name: string | null;
  participants: string[];
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

export type Friend = {
  uid: string;
  name: string | null;
  email: string | null;
  addedAt: Timestamp | null;
};
