"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Loader2, Smile } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { useDocumentData } from "react-firebase-hooks/firestore";
import EmojiPicker from "emoji-picker-react";

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
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [cursorPosition, setCursorPosition] = useState<number>(0);

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

  // Handle keyboard shortcuts for undo (Cmd+Z on Mac, Ctrl+Z on Windows) and redo (Cmd+Shift+Z on Mac, Ctrl+Y on Windows)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? event.metaKey : event.ctrlKey;
      
      // Undo: Cmd+Z (Mac) or Ctrl+Z (Windows)
      if (cmdOrCtrl && event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      }
      // Redo: Cmd+Shift+Z (Mac) or Ctrl+Y (Windows)
      else if (
        (isMac && cmdOrCtrl && event.shiftKey && event.key === 'z') ||
        (!isMac && cmdOrCtrl && event.key === 'y')
      ) {
        event.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [historyIndex, history]);

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
    if (input.trim()) {
      setIsUpdating(true); // Start updating
      await updateDoc(doc(db, "documents", id), { title: input });
      setIsUpdating(false); // End updating
    }
  };

  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setInput(history[newIndex]);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.setSelectionRange(cursorPosition, cursorPosition);
      }, 0);
    }
  };

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
        <div className="text-red-600">Error loading document: {error.message}</div>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 h-full bg-white p-5">
        <div className="max-w-6xl mx-auto pb-5 relative">
          {/* Mobile-friendly layout */}
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
            {/* Title Input Section */}
            <div className="flex-1">
              <form onSubmit={updateTitle} className="w-full">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  onClick={() =>
                    setCursorPosition(inputRef.current?.selectionStart || 0)
                  }
                  placeholder="Enter document title"
                  className="text-lg font-medium w-full"
                />
              </form>
            </div>

            {/* Action Buttons Section */}
            <div className="flex items-center gap-3 flex-wrap">
              {/* Favorite Emojis - Hidden on mobile, visible on large screens */}
              <div className="hidden lg:flex space-x-1">
                {favoriteEmojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => addFavoriteEmoji(emoji)}
                    className="text-xl transition-all duration-200 transform hover:scale-110 hover:bg-gray-100 rounded-lg p-2 hover:shadow-sm border border-transparent hover:border-gray-200"
                    title={`Add ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Emoji Picker Button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200 border border-gray-200 hover:border-gray-300 shadow-sm"
                  title="Open emoji picker"
                >
                  <Smile className="h-5 w-5 text-gray-600" />
                </button>

                {/* Emoji Picker */}
                {showEmojiPicker && (
                  <div
                    ref={emojiPickerRef}
                    className="absolute z-50 mt-2 right-0 lg:right-0"
                    style={{ top: "100%" }}
                  >
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2">
                      <EmojiPicker
                        onEmojiClick={onEmojiClick}
                        reactionsDefaultOpen={false}
                        searchPlaceholder="Search emoji..."
                        width={350}
                        height={400}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Update Button */}
              <Button
                disabled={isUpdating}
                type="submit"
                onClick={updateTitle}
                className={`${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUpdating ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin h-4 w-4" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update"
                )}
              </Button>
            </div>
          </div>
        </div>

        <hr className="border-gray-200 mb-10" />

        {/* Document content area */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg">
              Document content area - Add your editor component here
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Document;

