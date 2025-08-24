"use server";

import { adminDb } from "@/firebase-admin";
// import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";

export async function createNewDocument() {
  // auth.protect();
  await auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  const Email = sessionClaims?.["email"];
  if (!Email) {
    throw new Error("Email is required to create a new document.");
  }

  const docCollectionRef = adminDb.collection("documents");
  const docRef = await docCollectionRef.add({
    title: "New Doc",
  });

  await adminDb
    .collection("users")
    .doc(Email)
    .collection("rooms")
    .doc(docRef.id)
    .set({
      userId: Email,
      role: "owner",
      createdAt: new Date(),
      roomId: docRef.id,
    });

  return { docId: docRef.id };
}

export async function deleteDocument(roomId: string) {
  await auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  console.log("deleteDocument: ", roomId);

  const Email = sessionClaims?.["email"];
  if (!Email) {
    throw new Error("Email is required to create a new document.");
  }

  try {
    await adminDb.collection("documents").doc(roomId).delete();
    const query = await adminDb
      .collection("rooms")
      .where("roomId", "==", roomId)
      .get();
    const batch = adminDb.batch();
    query.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    // await liveblocks.deleteRoom(roomId);

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function inviteUserToDocument(roomId: string, email: string) {
  auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  console.log("inviteUserToDocument: ", roomId, " & email: ", email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({ userId: email, role: "editor", createAt: new Date(), roomId });
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function removeUserFromDocument(roomId: string, email: string) {
  auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  console.log("removeUserFromDocument: ", roomId, " & email: ", email);

  try {
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();
    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

