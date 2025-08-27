"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { Button } from "./ui/button";
import { removeUserFromDocument } from "@/actions/actions";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import useOwner from "@/lib/useOwner";
import { useRoom } from "@liveblocks/react/suspense";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, query, where } from "firebase/firestore";
import { db } from "@/firebase";
import { useDocumentAccess } from "@/lib/useDocumentAccess";

function  ManageUsers() {
  const { user } = useUser();
  const room = useRoom();
  const isOwner = useOwner();
  const [isOpen, setIsOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null); // Track the user being removed
  const { checkAccess } = useDocumentAccess();

  const [usersInRoom] = useCollection(
    user && query(collection(db, "rooms"), where("roomId", "==", room.id))
  );

  const capitalize = (text: string) =>
    text.charAt(0).toUpperCase() + text.slice(1);

  const sortedUsers = usersInRoom?.docs.sort((a, b) => {
    if (a.data().role === "owner") return -1; // Owner comes first
    if (b.data().role === "owner") return 1;
    return 0; // Maintain original order for others
  });

  const handleDelete = async (userId: string) => {
    setRemovingUserId(userId); // Set the user being removed
    
    // Check access before removing user
    const hasAccessToDocument = await checkAccess();
    if (!hasAccessToDocument) {
      setRemovingUserId(null);
      return; // Access check will handle redirect
    }

    if (!user) return;

    const result = await removeUserFromDocument(room.id, userId);

    if (result?.success) {
      toast.success("User removed from room successfully!");
    } else {
      toast.error("Failed to remove user from room!");
    }

    setRemovingUserId(null); // Reset after removal
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
      }}
    >
      <Button asChild variant="outline">
        <DialogTrigger>Users ({usersInRoom?.docs.length})</DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader className="flex items-center">
          <DialogTitle>User with Access</DialogTitle>
          <DialogDescription>
            Below is a list of users who have access to this document.
          </DialogDescription>
        </DialogHeader>

        <hr className="my-2" />

        <div className="flex flex-col space-y-2">
          {sortedUsers?.map((doc) => (
            <div
              key={doc.data().userId}
              className="flex items-center justify-between"
            >
              <p className="font-light">
                {doc.data().userId === user?.emailAddresses[0]?.toString() ? (
                  <span className="font-bold text-blue-800">
                  {doc.data().userId} (You)
                </span>
                ) : (
                  doc.data().userId
                )}
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline">{capitalize(doc.data().role)}</Button>

                {isOwner &&
                  doc.data().userId !== user?.emailAddresses[0]?.toString() && (
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(doc.data().userId)}
                      disabled={removingUserId === doc.data().userId}
                      size="sm"
                      className="text-sm"
                    >
                      {removingUserId === doc.data().userId
                        ? "Removing..."
                        : "Remove"}
                    </Button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ManageUsers;
