"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState, useTransition } from "react";
import { Button } from "./ui/button";
import { usePathname, useRouter } from "next/navigation";
import { deleteDocument } from "@/actions/actions";
import { toast } from "sonner";
import { useDocumentAccess } from "@/lib/useDocumentAccess";

function DeleteDocument() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition(); // Corrected typo here
  const pathname = usePathname();
  const router = useRouter();
  const { checkAccess } = useDocumentAccess();

  const handleDelete = async () => {
    const roomId = pathname.split("/").pop();
    if (!roomId) return;

    startTransition(async () => {
      // Check access before deleting
      const hasAccessToDocument = await checkAccess();
      if (!hasAccessToDocument) {
        return; // Access check will handle redirect
      }
      
      const result = await deleteDocument(roomId);

      if (result?.success) {
        setIsOpen(false); // Close dialog only after deletion
        router.replace("/");
        toast.success("Room Deleted Successfully!");
      } else {
        toast.error("Failed to delete document!");
      }
    });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isPending) {
          setIsOpen(open);
        }
      }}
    >
      <Button asChild variant="destructive" className="cursor-pointer">
        <DialogTrigger>Delete</DialogTrigger>
      </Button>
      <DialogContent
        onClick={(e) => {
          if (isPending) e.stopPropagation();
        }}
      >
        <DialogHeader>
          <DialogTitle>Are you sure you want to Delete?</DialogTitle>
          <DialogDescription>
            This will delete the document and all its contents, removing all
            users from the document.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            {isPending ? "Deleting..." : "Delete"}
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="secondary" disabled={isPending}>
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DeleteDocument;
