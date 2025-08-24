"use client";

import { useTransition } from "react";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { createNewDocument } from "@/actions/actions";
import { Loader2 } from "lucide-react";

interface NewDocumentButtonProps {
  isDisabled: boolean;
}

function NewDocumentButton({ isDisabled }: NewDocumentButtonProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleCreateNewDocument = () => {
    startTransition(async () => {
      const result = await createNewDocument();
      if (result?.docId) {
        // Check if docId exists
        router.push(`/doc/${result.docId}`);
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
