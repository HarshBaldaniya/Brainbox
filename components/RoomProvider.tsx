"use client";

import {
  ClientSideSuspense,
  RoomProvider as RoomProviderWrapper,
} from "@liveblocks/react/suspense";
import LoadingSpinner from "./LoadingSpinner";
import LiveCuresorProvider from "./LiveCuresorProvider";
import DocumentErrorHandler from "./DocumentErrorHandler";
import DocumentAccessGuard from "./DocumentAccessGuard";

function RoomProvider({
  roomId,
  children,
}: {
  roomId: string;
  children: React.ReactNode;
}) {
  return (
    <RoomProviderWrapper
      id={roomId}
      initialPresence={{
        cursor: null,
      }}
    >
      <ClientSideSuspense fallback={<LoadingSpinner />}>
        <LiveCuresorProvider>
          <DocumentErrorHandler />
          <DocumentAccessGuard>
            {children}
          </DocumentAccessGuard>
        </LiveCuresorProvider>
      </ClientSideSuspense>
    </RoomProviderWrapper>
  );
}
export default RoomProvider;
