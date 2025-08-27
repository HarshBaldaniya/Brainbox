"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createNewDocument, cleanupOrphanedEntries } from "@/actions/actions";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewDocumentButtonProps {
  isDisabled: boolean;
}

function NewDocumentButton({ isDisabled }: NewDocumentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const result = await createNewDocument();
      if (result?.success && result?.docId) {
        // Check if docId exists
        router.push(`/doc/${result.docId}`);
      } else if (result?.error) {
        // If it's a document limit error, try to clean up orphaned entries
        if (result.error.includes("5 documents")) {
          toast.info("Cleaning up document count...");
          const cleanupResult = await cleanupOrphanedEntries();
          if (cleanupResult?.success) {
            toast.success(cleanupResult.message);
            // Try creating document again
            const retryResult = await createNewDocument();
            if (retryResult?.success && retryResult?.docId) {
              router.push(`/doc/${retryResult.docId}`);
            } else if (retryResult?.error) {
              toast.error(retryResult.error);
            }
          } else {
            toast.error(result.error);
          }
        } else {
          toast.error(result.error);
        }
      }
    });
  };

  return (
    <Button
      onClick={handleCreateNewDocument}
      disabled={isPending}
      className={`w-[100%] ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {isPending ? (
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-5 w-5 text-gray-500" /> 
          <span>Creating...</span>
        </div>
      ) : (
        "New Document"
      )}
    </Button>
  );
}

export default NewDocumentButton;
