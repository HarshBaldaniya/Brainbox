"use client";

import { MenuIcon } from "lucide-react";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useUser } from "@clerk/nextjs";
import {
  collectionGroup,
  DocumentData,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/firebase";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import NewDocumentButton from "./NewDocumentButton";
import SidebarOption from "./SidebarOption";

interface RoomDocument extends DocumentData {
  createdAt: string;
  role: "owner" | "editor";
  roomId: string;
  userId: string;
}

function Sidebar() {
  const date = new Date();
  const year = date.getFullYear();

  const { user, isSignedIn, isLoaded } = useUser();
  const [groupedData, setGroupedData] = useState<{
    owner: RoomDocument[];
    editor: RoomDocument[];
  }>({
    owner: [],
    editor: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  const [data, loading, error] = useCollection(
    user &&
      query(
        collectionGroup(db, "rooms"),
        where("userId", "==", user.emailAddresses[0].toString())
      )
  );

  useEffect(() => {
    if (loading) {
      setIsLoading(true);
      return;
    }
    // if (!data || !isSignedIn) {
    //   setGroupedData({ owner: [], editor: [] });
    //   return;
    // }
    if (data) {
      const grouped = data.docs.reduce<{
        owner: RoomDocument[];
        editor: RoomDocument[];
      }>(
        (acc, curr) => {
          const roomData = curr.data() as RoomDocument;

          if (roomData.role === "owner") {
            acc.owner.push({
              id: curr.id,
              ...roomData,
            });
          } else {
            acc.editor.push({
              id: curr.id,
              ...roomData,
            });
          }

          return acc;
        },
        {
          owner: [],
          editor: [],
        }
      );

      setGroupedData(grouped);
      setIsLoading(false);
    }
  }, [data, loading]);

  const renderSkeletons = (count: number) => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} className="h-10 w-full bg-gray-300 rounded-md" />
      ))}
    </div>
  );

  const menuOptions = (
    <>
      <NewDocumentButton isDisabled={!isSignedIn} />

      <div className="flex py-3  flex-col space-y-2">
        {isLoaded && isSignedIn ? (
          isLoading ? (
            <>
              <h2 className="text-gray-500 font-semibold text-sm">
                My Documents
              </h2>
              {renderSkeletons(4)}
            </>
          ) : groupedData.owner.length === 0 ? (
            <h2 className="text-gray-500 font-semibold text-sm">
              No Documents Found!
            </h2>
          ) : (
            <>
              <h2 className="text-gray-500 font-semibold text-sm">
                My Documents
              </h2>
              {groupedData.owner.map((doc) => (
                <SidebarOption
                  key={doc.id}
                  id={doc.id}
                  href={`/doc/${doc.id}`}
                />
              ))}
            </>
          )
        ) : (
          isLoaded && (
            <h2 className="text-gray-500 font-semibold text-sm">
              Please log in to create and view all documents.
            </h2>
          )
        )}
        {isLoaded && isSignedIn && groupedData.editor.length > 0 && (
          <>
            <h2 className="text-gray-500 font-semibold text-sm">
              Shared With Me
            </h2>
            {isLoading
              ? renderSkeletons(3)
              : groupedData.editor.map((doc) => (
                  <SidebarOption
                    key={doc.id}
                    id={doc.id}
                    href={`/doc/${doc.id}`}
                  />
                ))}
          </>
        )}{" "}
      </div>
    </>
  );

  return (
    <div className="p-2 md:p-5 bg-gray-200 relative lg:min-w-[200px] lg:max-w-[200px] text-black">
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger>
            <MenuIcon className="p-2 hover:opacity-60 rounded-lg" size={40} />
          </SheetTrigger>
          <SheetContent className="flex flex-col ">
            <SheetHeader className="flex-grow">
              <SheetTitle>Menu</SheetTitle>
              <div>{menuOptions}</div>
            </SheetHeader>
            <div className="border-t p-4">
              <SheetFooter>@{year} Brainbox</SheetFooter>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:inline">{menuOptions}</div>
    </div>
  );
}

export default Sidebar;
