"use server";

import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { APP_LIMITS, ERROR_MESSAGES } from "@/lib/limits";

export async function createNewDocument() {  
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

  // Get accurate document count and clean up orphaned entries
  const actualDocCount = await getAccurateDocumentCount(Email);
  console.log(`User ${Email} has ${actualDocCount} actual documents`);

  if (actualDocCount >= APP_LIMITS.MAX_DOCS_PER_USER) {
    return { 
      success: false, 
      error: ERROR_MESSAGES.MAX_DOCS_EXCEEDED 
    };
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

  return { docId: docRef.id, success: true };
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
    // Check current number of users in the document
    const currentUsersQuery = await adminDb
      .collection("rooms")
      .where("roomId", "==", roomId)
      .get();

    if (currentUsersQuery.size >= APP_LIMITS.MAX_USERS_PER_DOC) {
      return { 
        success: false, 
        error: ERROR_MESSAGES.MAX_USERS_EXCEEDED 
      };
    }

    // Check if user is already in the document
    const existingUserQuery = await adminDb
      .collection("rooms")
      .where("roomId", "==", roomId)
      .where("userId", "==", email)
      .get();

    if (!existingUserQuery.empty) {
      return { 
        success: false, 
        error: "User is already invited to this document." 
      };
    }

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

// Utility function to clean up orphaned entries and get accurate document count
async function getAccurateDocumentCount(userEmail: string) {
  const userDocsQuery = await adminDb
    .collection("users")
    .doc(userEmail)
    .collection("rooms")
    .get();

  let actualDocCount = 0;
  const batch = adminDb.batch();
  let hasOrphanedEntries = false;
  
  for (const userDoc of userDocsQuery.docs) {
    const docExists = await adminDb
      .collection("documents")
      .doc(userDoc.id)
      .get();
    
    if (docExists.exists) {
      actualDocCount++;
    } else {
      // Remove orphaned entry
      batch.delete(userDoc.ref);
      hasOrphanedEntries = true;
    }
  }

  // Commit cleanup if needed
  if (hasOrphanedEntries) {
    await batch.commit();
    console.log(`Cleaned up ${userDocsQuery.size - actualDocCount} orphaned entries for user ${userEmail}`);
  }

  return actualDocCount;
}

// Manual cleanup function for orphaned entries
export async function cleanupOrphanedEntries() {
  await auth.protect();
  
  const { sessionClaims } = await auth();
  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  const Email = sessionClaims?.["email"];
  if (!Email) {
    throw new Error("Email is required.");
  }

  const count = await getAccurateDocumentCount(Email);
  return { success: true, message: `Cleanup completed. You have ${count} documents.` };
}

