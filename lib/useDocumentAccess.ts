"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { useRoom } from "@liveblocks/react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/firebase";

export function useDocumentAccess() {
  const { user } = useUser();
  const room = useRoom();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkAccess = useCallback(async (): Promise<boolean> => {
    if (!user || !room) return false;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return false;

    setIsChecking(true);

    try {
      // Check rooms collection
      const roomsQuery = query(
        collection(db, "rooms"),
        where("roomId", "==", room.id),
        where("userId", "==", userEmail)
      );
      const roomsSnapshot = await getDocs(roomsQuery);

      // Check user's rooms collection
      const userRoomsQuery = query(
        collection(db, "users"),
        where("email", "==", userEmail)
      );
      const userRoomsSnapshot = await getDocs(userRoomsQuery);

      const hasAccessToDocument = !roomsSnapshot.empty || !userRoomsSnapshot.empty;
      setHasAccess(hasAccessToDocument);
      return hasAccessToDocument;
    } catch (error) {
      console.error("Error checking document access:", error);
      setHasAccess(false);
      return false;
    } finally {
      setIsChecking(false);
    }
  }, [user, room]);

  // Check access on mount
  useEffect(() => {
    checkAccess();
  }, [user, room, checkAccess]);

  return {
    hasAccess,
    isChecking,
    checkAccess,
  };
}
