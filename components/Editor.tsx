"use client";

import { useRoom, useSelf } from "@liveblocks/react";
import { useEffect, useState, useMemo } from "react";
import * as Y from "yjs";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { Button } from "./ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { BlockNoteView } from "@blocknote/shadcn";
import { BlockNoteEditor } from "@blocknote/core";
import { useCreateBlockNote } from "@blocknote/react";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/shadcn/style.css";
import stringToColor from "@/lib/stringToColor";
import TraslateDocument from "./TraslateDocument";
import ChatToDocument from "./ChatToDocument";
 
type EditorProps = {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  darkmode: boolean;
};

function BlockNote({ doc, provider, darkmode }: EditorProps) {
  const userInfo = useSelf((me) => me.info);

  const user = useMemo(() => ({
    name: userInfo?.name || "Anonymous",
    color: stringToColor(userInfo?.email || "anonymous@example.com"),
  }), [userInfo?.name, userInfo?.email]);

  const editor: BlockNoteEditor = useCreateBlockNote({
    collaboration: {
      provider,
      fragment: doc.getXmlFragment("document-store"),
      user,
    },
  });
  return (
    <div
      className="relative max-w-6xl mx-auto min-h-screen"
      style={{
        background: darkmode
          ? "radial-gradient(circle, #020817 60%, #020817 100%)"
          : "radial-gradient(circle, #ffffff 60%, #ffffff 100%)",
        padding: "4px 0",
        borderRadius: "12px",
      }}
    >
      <BlockNoteView
        className="pt-2 min-h-screen rounded-lg"
        editor={editor}
        theme={darkmode ? "dark" : "light"}
        style={{
          backgroundColor: darkmode ? "#020817" : "#ffffff",
          color: darkmode ? "#ffffff" : "#000000",
          borderRadius: "8px",
        }}
      />
    </div>
  );
}

function Editor() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<LiveblocksYjsProvider>();
  const [darkmode, setDarkmod] = useState(false);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  if (!doc || !provider) return null;

  const style = `hover:text-white ${
    darkmode
      ? "text-gray-300 bg-gray-700 hover:bg-gray-100 hover:text-gray-700"
      : "text-gray-700 bg-gray-200 hover:bg-gray-300 hover:text-gray-700"
  }
  `;
  return (
    <div className="max-6xl ma-auto">
      <div className="flex items-center gap-2 sm:gap-3 justify-center sm:justify-end mb-6 sm:mb-10">
        <TraslateDocument doc={doc} />
        <ChatToDocument doc={doc} />
        <Button className={`${style} w-10 h-10 sm:w-auto sm:h-auto p-2 sm:px-3 sm:py-2 cursor-pointer`} onClick={() => setDarkmod(!darkmode)}>
          {darkmode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
        </Button>
      </div>

      <BlockNote doc={doc} provider={provider} darkmode={darkmode} />
    </div>
  );
}
export default Editor;
