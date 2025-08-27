"use client";

import { FormEvent, useEffect, useRef, useState, useCallback } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Smile } from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import EmojiPicker from "emoji-picker-react";
import Editor from "./Editor";
import ManageUsers from "./ManageUsers";
import Avatars from "./Avatars";
import useOwner from "@/lib/useOwner";
import InviteUser from "./InviteUser";
import DeleteDocument from "./DeleteDocument";
import { useDocumentAccess } from "@/lib/useDocumentAccess";
import { APP_LIMITS, ERROR_MESSAGES } from "@/lib/limits";

interface EmojiObject {
  emoji: string;
  unified: string;
  activeSkinTone?: string;
}

function Document({ id }: { id: string }) {
  const [data, loading, error] = useDocumentData(doc(db, "documents", id));
  const [input, setInput] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);
  const isOwner = useOwner();
  const { checkAccess } = useDocumentAccess();

  // History state for undo and redo
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  const favoriteEmojis = ["😊", "💪", "🔥"];

  useEffect(() => {
    if (data) {
      setInput(data.title);
      setHistory([data.title]); // Initialize history with the document title
      setHistoryIndex(0); // Set history index to start
    }
  }, [data]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInput(newValue);
    setCursorPosition(e.target.selectionStart || 0);

    // Add to history only if new value differs from the last saved value
    if (history[historyIndex] !== newValue) {
      const newHistory = [...history.slice(0, historyIndex + 1), newValue];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1); // Move index to the latest
    }
  };

  const updateTitle = async (e: FormEvent) => {
    e.preventDefault();
    
    // Check access before updating
    const hasAccessToDocument = await checkAccess();
    if (!hasAccessToDocument) {
      return; // Access check will handle redirect
    }
    
    // Validate title length
    if (input.length > APP_LIMITS.MAX_TITLE_LENGTH) {
      toast.error(ERROR_MESSAGES.TITLE_TOO_LONG);
      return;
    }
    
    if (input.length < APP_LIMITS.MIN_TITLE_LENGTH) {
      toast.error(ERROR_MESSAGES.TITLE_TOO_SHORT);
      return;
    }
    
    if (input.trim()) {
      setIsUpdating(true); // Start updating
      await updateDoc(doc(db, "documents", id), { title: input });
      setIsUpdating(false); // End updating
    }
  };

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, [historyIndex, history, cursorPosition]);

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  }, [historyIndex, history, cursorPosition]);

  // Handle keyboard shortcuts for undo (Cmd+Z on Mac, Ctrl+Z on Windows) and redo (Cmd+Shift+Z on Mac, Ctrl+Y on Windows)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;

      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
      if (cmdOrCtrl && event.key === "z" && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Redo: Cmd+Shift+Z (Mac) or Ctrl+Y (Windows)
      else if (
        (isMac && cmdOrCtrl && event.shiftKey && event.key === "z") ||
        (!isMac && cmdOrCtrl && event.key === "y")
      ) {
        event.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [undo, redo]);

  const onEmojiClick = (emojiObject: EmojiObject) => {
    if (inputRef.current) {
      const newText =
        input.slice(0, cursorPosition) +
        emojiObject.emoji +
        input.slice(cursorPosition);
      setInput(newText);
      const newCursorPosition = cursorPosition + emojiObject.emoji.length;
      setCursorPosition(newCursorPosition);

      // Update history with emoji insertion
      const newHistory = [...history.slice(0, historyIndex + 1), newText];
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1); // Move index to the latest

      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const addFavoriteEmoji = (emoji: string) => {
    onEmojiClick({ emoji, unified: "" });
  };

  if (loading) {
    return (
      <div className="flex-1 h-full bg-white p-5 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="animate-spin h-6 w-6 text-gray-500" />
          <span className="text-gray-600">Loading document...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 h-full bg-white p-5 flex items-center justify-center">
        <div className="text-red-600">
          Error loading document: {error.message}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 h-full bg-gray-50 p-3 sm:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Main Content Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
            {/* Header Section */}
            <div className="space-y-4">
              {/* Title Input - Full Width */}
              <div className="w-full">
                <form onSubmit={updateTitle}>
                  <div className="relative">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onClick={() =>
                        setCursorPosition(inputRef.current?.selectionStart || 0)
                      }
                      placeholder="Enter document title"
                      className="pr-16 text-base sm:text-lg lg:text-xl font-semibold w-full border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 px-4 py-3 rounded-md bg-white transition-all duration-200 placeholder:text-gray-400"
                      maxLength={APP_LIMITS.MAX_TITLE_LENGTH}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400">
                      {input.length}/{APP_LIMITS.MAX_TITLE_LENGTH}
                    </div>
                  </div>
                </form>
              </div>

              {/* Action Buttons - Mobile Stacked */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Favorite Emojis - Hidden on Mobile */}
                <div className="hidden sm:flex space-x-1">
                  {favoriteEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => addFavoriteEmoji(emoji)}
                      className="text-lg sm:text-xl transition-all duration-200 hover:bg-gray-100 rounded-lg p-2 hover:shadow-sm cursor-pointer"
                      title={`Add ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Emoji Picker */}
                <div className="relative hidden sm:block">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEmojiPicker(!showEmojiPicker);
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }}
                    className="w-full sm:w-auto p-3 sm:p-2 bg-white hover:bg-gray-50 rounded-lg transition-all duration-200 border-2 border-gray-300 hover:border-gray-400 shadow-sm flex items-center justify-center sm:justify-start gap-2 cursor-pointer"
                    title="Open emoji picker"
                  >
                    <Smile className="h-5 w-5 text-gray-600" />
                    <span className="sm:hidden text-sm font-medium">Add Emoji</span>
                  </button>

                  {showEmojiPicker && (
                    <div
                      ref={emojiPickerRef}
                      className="absolute z-50 mt-2"
                      style={{ 
                        top: "100%",
                        left: "0",
                        right: "0",
                        maxWidth: "320px"
                      }}
                    >
                      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                        <EmojiPicker
                          onEmojiClick={onEmojiClick}
                          reactionsDefaultOpen={false}
                          searchPlaceholder="Search emoji..."
                          width={280}
                          height={320}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Button - Full Width on Mobile */}
                <Button
                  disabled={isUpdating || isInviting}
                  type="submit"
                  onClick={updateTitle}
                  className="w-full sm:w-auto bg-gray-700 hover:bg-gray-800 text-white px-4 py-3 sm:px-4 sm:py-2 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200 text-sm sm:text-base cursor-pointer"
                >
                  {isUpdating ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="animate-spin h-4 w-4" />
                      <span>Updating...</span>
                    </div>
                  ) : (
                    "Update Document"
                  )}
                </Button>

                {/* Owner Actions - Stacked on Mobile */}
                {isOwner && (
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <InviteUser onInviting={(status) => setIsInviting(status)} />
                    <DeleteDocument />
                  </div>
                )}
              </div>

              {/* User Management Row - Mobile Optimized */}
              <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
                <ManageUsers />
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                  <span className="hidden sm:inline text-sm text-gray-600 text-right">Users currently editing this page!</span>
                  <Avatars />
                </div>
              </div>
            </div>
          </div>

          {/* Content Separator */}
          <hr className="border-gray-200 my-6" />

          {/* Document content area */}
          <div className="relative">
            <Editor />
          </div>
        </div>
      </div>
    </>
  );
}

export default Document;
