import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { adminDb } from "@/firebase-admin";

export async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return;
  }

  const userEmail = sessionClaims.email as string;

  try {
    // Check if document exists
    const docRef = await adminDb.collection("documents").doc(id).get();
    if (!docRef.exists) {
      redirect("/");
    }

    // Check if user has access to this document - check both collections
    const [roomsQuery, userRoomsQuery] = await Promise.all([
      // Check rooms collection
      adminDb
        .collection("rooms")
        .where("roomId", "==", id)
        .where("userId", "==", userEmail)
        .get(),
      // Check user's rooms collection
      adminDb
        .collection("users")
        .doc(userEmail)
        .collection("rooms")
        .doc(id)
        .get()
    ]);

    // User has access if they exist in either collection
    if (roomsQuery.empty && !userRoomsQuery.exists) {
      redirect("/");
    }

    return <RoomProvider roomId={id}>{children}</RoomProvider>;
  } catch (error) {
    console.error("Error checking document access:", error);
    redirect("/");
  }
}
export default DocLayout;
