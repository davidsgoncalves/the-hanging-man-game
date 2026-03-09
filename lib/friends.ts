import { getDbClient, getServerTimestamp } from "@/lib/firebase-client";

type PlayerInfo = {
  uid: string;
  name: string | null;
  email: string | null;
};

/**
 * Salva dois jogadores como amigos mutuamente.
 * Se o amigo já existir na lista do usuário, ignora (não duplica).
 * Collection: users/{uid}/friends/{friendUid}
 */
export const saveFriendsMutually = async (
  player1: PlayerInfo,
  player2: PlayerInfo,
) => {
  const db = getDbClient();
  if (!db) return;

  const batch = db.batch();

  const friend1Ref = db
    .collection("users")
    .doc(player1.uid)
    .collection("friends")
    .doc(player2.uid);

  const friend2Ref = db
    .collection("users")
    .doc(player2.uid)
    .collection("friends")
    .doc(player1.uid);

  const [snap1, snap2] = await Promise.all([
    friend1Ref.get(),
    friend2Ref.get(),
  ]);

  if (!snap1.exists) {
    batch.set(friend1Ref, {
      uid: player2.uid,
      name: player2.name,
      email: player2.email,
      addedAt: getServerTimestamp(),
    });
  }

  if (!snap2.exists) {
    batch.set(friend2Ref, {
      uid: player1.uid,
      name: player1.name,
      email: player1.email,
      addedAt: getServerTimestamp(),
    });
  }

  await batch.commit();
};
