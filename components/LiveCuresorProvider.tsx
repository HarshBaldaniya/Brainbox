"use client";

import { useMyPresence, useOthers } from "@liveblocks/react/suspense";
import { PointerEvent, useCallback, useMemo } from "react";
import FollowPointer from "./FollowPointer";

function LiveCuresorProvider({ children }: { children: React.ReactNode }) {
  const [, updateMyPresence] = useMyPresence();
  const others = useOthers();

  const handlePointerMove = useCallback((e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cursor = { 
      x: Math.floor(e.clientX - rect.left), 
      y: Math.floor(e.clientY - rect.top) 
    };
    updateMyPresence({ cursor });
  }, [updateMyPresence]);

  const handlePointerLeave = useCallback(() => {
    updateMyPresence({ cursor: null });
  }, [updateMyPresence]);

  // Memoize the filtered others to avoid unnecessary re-renders
  const othersWithCursors = useMemo(() => {
    return others
      .filter((other) => other.presence.cursor != null)
      .map((other) => ({
        connectionId: other.connectionId,
        info: other.info,
        cursor: other.presence.cursor! // We know it's not null due to filter
      }));
  }, [others]);

  return (
    <div 
      onPointerMove={handlePointerMove} 
      onPointerLeave={handlePointerLeave}
      style={{ position: 'relative', width: '100%', height: '100%' }}
    >
      {othersWithCursors.map((other) => (
        <FollowPointer
          key={other.connectionId}
          info={other.info}
          x={other.cursor.x}
          y={other.cursor.y}
        />
      ))}

      {children}
    </div>
  );
}

export default LiveCuresorProvider;
