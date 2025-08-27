"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import * as Y from "yjs";
import { FormEvent, useState, useTransition, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { Input } from "./ui/input";
import { BotIcon, MessageCircleCode } from "lucide-react";
import Markdown from "react-markdown";

function ChatToDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<
    { question: string; response: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  const CACHE_KEY = "chatToDocumentHistory";

  // Load history from Cache API on component mount
  useEffect(() => {
    (async () => {
      if ("caches" in window) {
        try {
          const cache = await caches.open(CACHE_KEY);
          const response = await cache.match(CACHE_KEY);
          if (response) {
            const cachedHistory = await response.json();
            setHistory(cachedHistory);
          }
        } catch (error) {
          console.error("Error loading from cache:", error);
        }
      }
    })();
  }, []);

  // Save history to Cache API whenever it changes
  useEffect(() => {
    (async () => {
      if ("caches" in window) {
        try {
          const cache = await caches.open(CACHE_KEY);
          const response = new Response(JSON.stringify(history));
          await cache.put(CACHE_KEY, response);
        } catch (error) {
          console.error("Error saving to cache:", error);
        }
      }
    })();
  }, [history]);

  const handleAskQuestion = async (e: FormEvent) => {
    e.preventDefault();

    const currentQuestion = input;

    startTransition(async () => {
      const documentData = doc.get("document-store").toJSON();

      try {
        // Use Cloudflare URL directly with fallback
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wispy-forest-bdef.baldaniyaharsh5.workers.dev";
        
        // Debug: Log the URL being called
        console.log("Calling API URL:", `${baseUrl}/chatToDocument`);
        
        const res = await fetch(
          `${baseUrl}/chatToDocument`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              documentData,
              question: currentQuestion,
            }),
          }
        );

        if (res.ok) {
          const { message } = await res.json();
          setInput("");
          setHistory((prev) => [
            ...prev,
            { question: currentQuestion, response: message },
          ]);
          toast.success("Question asked successfully!");
        } else {
            const errorResponse = await res.json();

            // Handle rate limit and other API errors
            if (res.status === 429 || res.status === 500 || res.status >= 400) {
                const errorMessage = errorResponse.error || "Service temporarily unavailable. Please try again later.";
                setHistory((prev) => [
                    ...prev,
                    {
                        question: currentQuestion,
                        response: "System limit exceeded. Please try again later.",
                    },
                ]);
                toast.error("System limit exceeded. Please try again later.");
            } else {
                setHistory((prev) => [
                    ...prev,
                    {
                        question: currentQuestion,
                        response: "An error occurred while processing your request.",
                    },
                ]);
                toast.error("Failed to get a valid response.");
            }
        }
      } catch {
        setHistory((prev) => [
          ...prev,
          {
            question: currentQuestion,
            response: "Unable to reach the server. Please try again later.",
          },
        ]);
        toast.error("Unable to reach the server.");
      }
    });
  };

  // Auto-scroll to the latest question
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline" className="w-10 h-10 sm:w-auto sm:h-auto p-2 sm:px-3 sm:py-2 cursor-pointer">
        <DialogTrigger>
          <MessageCircleCode className="w-5 h-5" />
          <span className="hidden sm:inline">Chat to Document</span>
        </DialogTrigger>
      </Button>
      <DialogContent className="w-[90vw] max-w-3xl">
        <DialogHeader className="flex items-center">
          <DialogTitle>Chat to the Document!</DialogTitle>
          <DialogDescription>
            Ask a question and chat to the document with AI.
          </DialogDescription>
        </DialogHeader>
        <hr className="mt-5" />

        {/* Conditionally render conversation history */}
        {history.length > 0 && (
          <div
            ref={containerRef}
            className="max-h-96 overflow-y-auto p-5 bg-gray-100 rounded-md"
          >
            <p className="font-semibold text-sm">All Questions</p>
            <hr className="mt-2 mb-2" />
            {history.map(({ question, response }, index) => (
              <div key={index} className="mb-4">
                <p className="text-gray-500 font-semibold">Q: {question}</p>
                <div className="flex gap-2 items-start mt-2">
                  <BotIcon className="w-5 flex-shrink-0 text-blue-500" />
                  <div className="text-sm">
                    <Markdown>{response}</Markdown>
                  </div>
                </div>
              </div>
            ))}

            {/* GPT is thinking animation */}
            {isPending && (
              <div className="flex gap-2 items-center mt-4">
                <BotIcon className="w-5 flex-shrink-0 text-blue-500 animate-spin" />
                <p className="font-semibold text-sm animate-pulse">
                  GPT is thinking...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Input form */}
        <form className="flex gap-2 mt-4" onSubmit={handleAskQuestion}>
          <Input
            type="text"
            placeholder="i.e. What is this about?"
            className="w-full"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <Button type="submit" disabled={!input || isPending}>
            {isPending ? "Asking..." : "Ask"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ChatToDocument;
