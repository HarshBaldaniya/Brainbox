"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormEvent, useState, memo } from "react";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import { inviteUserToDocument } from "@/actions/actions";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { useDocumentAccess } from "@/lib/useDocumentAccess";

function InviteUser({ onInviting }: { onInviting?: (isInviting: boolean) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false); // Local state for inviting
  const { checkAccess } = useDocumentAccess();

  const pathname = usePathname();

  const handleInvite = async (e: FormEvent) => {
    e.preventDefault();

    const roomId = pathname.split("/").pop();
    if (!roomId) return;

    setIsInviting(true); // Start inviting
    if (onInviting) onInviting(true); // Notify parent
    
    // Check access before inviting
    const hasAccessToDocument = await checkAccess();
    if (!hasAccessToDocument) {
      setIsInviting(false);
      if (onInviting) onInviting(false);
      return; // Access check will handle redirect
    }
    
    const result = await inviteUserToDocument(roomId, email);

    if (result?.success) {
      setIsOpen(false);
      setEmail("");
      toast.success("User Added to Room Successfully!");
    } else {
      toast.error(result?.error || "Failed to add user to room!");
    }
    setIsInviting(false); // End inviting
    if (onInviting) onInviting(false); // Notify parent
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!isInviting) {
          setIsOpen(open);
        }
      }}
    >
      <Button asChild variant="outline" className="cursor-pointer">
        <DialogTrigger>Invite</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a user to collaborate!</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to invite.
          </DialogDescription>
        </DialogHeader>

        <form className="flex gap-2" onSubmit={handleInvite}>
          <Input
            type="email"
            placeholder="Email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button type="submit" disabled={!email || isInviting}>
            {isInviting ? "Inviting..." : "Invite"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default memo(InviteUser);
