"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/firebase";
import { useRoom } from "@liveblocks/react";

function DocumentAccessGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useUser();
  const room = useRoom();
  const [hasAccess, setHasAccess] = useState(true);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (!user || !room) return;

    const userEmail = user.emailAddresses[0]?.emailAddress;
    if (!userEmail) return;

    // Set up real-time listener for user access
    const unsubscribe = onSnapshot(
      query(
        collection(db, "rooms"),
        where("roomId", "==", room.id),
        where("userId", "==", userEmail)
      ),
      (snapshot) => {
        const hasAccessToDocument = !snapshot.empty;
        
        if (!hasAccessToDocument && hasAccess) {
          // User lost access - redirect immediately
          setHasAccess(false);
          router.push("/");
        } else if (hasAccessToDocument && !hasAccess) {
          // User regained access
          setHasAccess(true);
        }
        
        setIsChecking(false);
      },
      (error) => {
        console.error("Error checking document access:", error);
        setIsChecking(false);
      }
    );

    return () => unsubscribe();
  }, [user, room, router, hasAccess]);

  // Show loading while checking access
  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If user doesn't have access, don't render children
  if (!hasAccess) {
    return null;
  }

  return <>{children}</>;
}

export default DocumentAccessGuard;
