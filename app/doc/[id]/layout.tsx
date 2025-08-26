import RoomProvider from "@/components/RoomProvider";
import { auth } from "@clerk/nextjs/server";

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

  return <RoomProvider roomId={id}>{children}</RoomProvider>;
}
export default DocLayout;
