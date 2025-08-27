"use server";

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
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

  // Add to user's rooms collection
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

  // Also add to rooms collection for consistency
  await adminDb
    .collection("rooms")
    .add({
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
    // Delete the document
    await adminDb.collection("documents").doc(roomId).delete();
    
    // Clean up rooms collection
    const roomsQuery = await adminDb
      .collection("rooms")
      .where("roomId", "==", roomId)
      .get();
    
    // Clean up users' rooms collections
    const usersQuery = await adminDb
      .collection("users")
      .get();
    
    const batch = adminDb.batch();
    
    // Delete from rooms collection
    roomsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Delete from all users' rooms collections
    for (const userDoc of usersQuery.docs) {
      const userRoomRef = adminDb
        .collection("users")
        .doc(userDoc.id)
        .collection("rooms")
        .doc(roomId);
      batch.delete(userRoomRef);
    }
    
    await batch.commit();

    await liveblocks.deleteRoom(roomId);

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function inviteUserToDocument(roomId: string, email: string) {
  await auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  console.log("inviteUserToDocument: ", roomId, " & email: ", email);

  try {
    // Add to user's rooms collection
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .set({ userId: email, role: "editor", createAt: new Date(), roomId });

    // Also add to rooms collection for consistency
    await adminDb
      .collection("rooms")
      .add({
        userId: email,
        role: "editor",
        createAt: new Date(),
        roomId: roomId,
      });

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

export async function removeUserFromDocument(roomId: string, email: string) {
  await auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  console.log("removeUserFromDocument: ", roomId, " & email: ", email);

  try {
    // Remove from user's rooms collection
    await adminDb
      .collection("users")
      .doc(email)
      .collection("rooms")
      .doc(roomId)
      .delete();

    // Remove from rooms collection
    const roomsQuery = await adminDb
      .collection("rooms")
      .where("roomId", "==", roomId)
      .where("userId", "==", email)
      .get();

    const batch = adminDb.batch();
    roomsQuery.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Remove user from Liveblocks room
    try {
      await liveblocks.deleteRoom(roomId);
    } catch (liveblocksError) {
      console.log("Liveblocks room deletion error:", liveblocksError);
      // Continue even if Liveblocks deletion fails
    }

    return { success: true };
  } catch (error) {
    console.log(error);
    return { success: false };
  }
}

