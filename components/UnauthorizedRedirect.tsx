"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRoom } from "@liveblocks/react";
import { Button } from "./ui/button";
import { AlertTriangle, Home } from "lucide-react";

function UnauthorizedRedirect() {
  const router = useRouter();
  const room = useRoom();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.error?.message?.includes("You are not in this room")) {
        setError("You have been removed from this document or don't have access.");
        setIsRedirecting(true);
        setTimeout(() => {
          router.push("/");
        }, 3000);
      }
    };

    // Listen for Liveblocks errors
    window.addEventListener("liveblocks-error", handleError);

    return () => {
      window.removeEventListener("liveblocks-error", handleError);
    };
  }, [room, router]);

  if (!error && !isRedirecting) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md mx-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-6">
          {error || "You don't have access to this document."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => router.push("/")}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Go to Home
          </Button>
          {isRedirecting && (
            <p className="text-sm text-gray-500">
              Redirecting automatically in 3 seconds...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UnauthorizedRedirect;
