export const normalizeWord = (raw: string) =>
  raw.replace(/[^A-Za-z]/g, "").toUpperCase();

export const buildMaskedWord = (word: string, guessedLetters: string[]) => {
  return word
    .split("")
    .map((letter) => (guessedLetters.includes(letter) ? letter : "_"))
    .join(" ");
};

export const hasWon = (word: string, guessedLetters: string[]) => {
  const uniqueLetters = Array.from(new Set(word.split("")));
  return uniqueLetters.every((letter) => guessedLetters.includes(letter));
};
