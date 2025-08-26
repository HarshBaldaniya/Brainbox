import { adminDb } from "@/firebase-admin";
import liveblocks from "@/lib/liveblocks";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest): Promise<Response> {
  await auth.protect();

  const { sessionClaims } = await auth();

  if (!sessionClaims) {
    (await auth()).redirectToSignIn();
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const { room } = await req.json();

  // Try different possible field names for email, name, and image
  const Email = sessionClaims?.['email'] as string || 
                sessionClaims?.['email_address'] as string || 
                ((sessionClaims?.['primary_email_address'] as Record<string, unknown>)?.email_address as string);
  
  const firstName = sessionClaims?.['firstname'] as string || '';
  const lastName = sessionClaims?.['lastname'] as string || '';
  
  // Name priority: full name → first+last name → email → "Anonymous User"
  const fullName = sessionClaims?.['fullname'] as string || 
                   sessionClaims?.['name'] as string || '';
  
  const constructedName = firstName && lastName ? `${firstName} ${lastName}` : '';
  
  const Name = fullName || constructedName || Email || 'Anonymous User';
  
  const Avatar = sessionClaims?.['image'] as string || 
                 sessionClaims?.['picture'] as string || 
                 sessionClaims?.['avatar'] as string || '';

  // Only require email as it's essential for the database operations
  if (!Email) {
    console.error("Email is missing from session claims");
    return NextResponse.json(
      { error: "Email is required to create a new document." },
      { status: 400 }
    );
  }

  const session = liveblocks.prepareSession(Email, {
    userInfo: {
      name: Name,
      email: Email,
      avatar: Avatar,
    },
  });

  // Get the specific user's `rooms` subcollection and look for the specified room
  const userRoomsRef = adminDb.collection("users").doc(Email).collection("rooms");
  const usersInRoom = await userRoomsRef.where("roomId", "==", room).get();

  if (usersInRoom.empty) {
    console.error("No documents found for the user with Email:", Email, "and room:", room);
    return NextResponse.json(
      { message: "You are not in this room!" },
      { status: 403 }
    );
  }

  const userInRoom = usersInRoom.docs[0];
//   console.log("User In Room Document Data:", userInRoom.data());

  if (userInRoom) {
    session.allow(room, session.FULL_ACCESS);
    const { body, status } = await session.authorize();

    return new Response(body, { status });
  } else {
    return NextResponse.json(
      { message: "You are not in this room!" },
      { status: 403 }
    );
  }
}
