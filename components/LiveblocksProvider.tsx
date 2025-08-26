"use client";

import { LiveblocksProvider } from "@liveblocks/react/suspense";

function LiveBlocksProvider({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLI_KEY) {
    throw new Error("NEXT_PUBLIC_LIVEBLOCKS_PUBLI_KEY is not set!");
  }
  return <LiveblocksProvider throttle={16} authEndpoint={'/auth-endpoint'}>{children}</LiveblocksProvider>;
}
export default LiveBlocksProvider;
