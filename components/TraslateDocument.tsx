"use client";

import * as Y from "yjs";
import { useState, FormEvent, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BotIcon, LanguagesIcon } from "lucide-react";
import { toast } from "sonner";
import Markdown from "react-markdown";
import { motion } from "framer-motion";
import { ClipboardCopyIcon } from "lucide-react"; // Import an icon for the copy button
import copy from "copy-to-clipboard";

type Language =
  | "hindi"
  | "gujarati"
  | "marathi"
  | "bengali"
  | "english"
  | "spanish"
  | "french"
  | "german"
  | "portuguese"
  | "chinese"
  | "arabic"
  | "russian"
  | "japanese";

const languages: Language[] = [
  "hindi",
  "gujarati",
  "marathi",
  "bengali",
  "english",
  "spanish",
  "french",
  "german",
  "portuguese",
  "chinese",
  "arabic",
  "russian",
  "japanese",
];


const funTexts = [
  "GPT is cooking up something tasty... 🍳",
  "⏳ Almost there...",
  "AI is hard at work - promise! 🤓",
  "Final countdown in progress... 🔢",
  "Loading genius thoughts... 💡",
  "The finish line is in sight... hang tight! 🏁",
  "Please wait... greatness takes time! ⏳",
  "Loading the final touch... 🚀",
  "The AI is Googling your answer... 🤔",
  "Refueling with virtual coffee... ☕",
  "Making sense of it all... 🧠",
  "AI is dreaming in binary... 0110✨",
  "Connecting to the AI mothership... 📡",
  "Polishing the perfect words... 🔍",
  "Rewriting the rules of translation... 🚀",
  "Thinking harder than ever... 🤯",
  "Putting on its creative hat... 🎩",
  "Almost there! Just one more neuron... 🧠",
  "AI is on a roll... literally! 🍣",
];


function TranslateDocument({ doc }: { doc: Y.Doc }) {
  const [isOpen, setIsOpen] = useState(false);
  const [language, setLanguage] = useState<string>("");
  const [summary, setSummary] = useState("");
  const [funText, setFunText] = useState(funTexts[0]);
  const [isPending, startTransition] = useTransition();

  const handleTranslate = (e: FormEvent) => {
    e.preventDefault();

    // Reset states before starting translation
    setSummary("");
    setFunText(funTexts[0]);

    startTransition(async () => {
      // Use Cloudflare URL directly with fallback
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://wispy-forest-bdef.baldaniyaharsh5.workers.dev";

      // Debug: Log the URL being called
      console.log("Calling API URL:", `${baseUrl}/translateDocument`);

      const documentData = doc.get("document-store").toJSON();

      if (!documentData || !language) {
        toast.error("Document data or language is missing.");
        return;
      }

      // console.log("Request Payload:", { documentData, targetLang: language });

      // Start updating fun text dynamically
      const intervalId = setInterval(() => {
        setFunText((prev) => {
          const currentIndex = funTexts.indexOf(prev);
          return funTexts[(currentIndex + 1) % funTexts.length];
        });
      }, 2000);

      try {
        const res = await fetch(`${baseUrl}/translateDocument`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            documentData,
            targetLang: language,
          }),
        });

        if (!res.ok) {
          const errorResponse = await res.json().catch(() => ({}));
          
          // Handle rate limit and other API errors
          if (res.status === 429 || res.status === 500 || res.status >= 400) {
            toast.error("System limit exceeded. Please try again later.");
          } else {
            toast.error("Failed to translate the document. Please try again.");
          }
          return;
        }

        const response = await res.json();
        // console.log("Full API Response:", response);

        const translatedText =
          response.translated_text || response.summary || null;

        if (!translatedText) {
          toast.error("Translation failed. No data available.");
          setSummary("No summary available.");
          return;
        }

        setSummary(translatedText);
        toast.success("Translated summary successfully!");
      } catch {
        // console.error("Fetch Error:", error);
        toast.error("An error occurred. Please try again later.");
      } finally {
        clearInterval(intervalId); // Stop updating fun text
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button asChild variant="outline" className="w-10 h-10 sm:w-auto sm:h-auto p-2 sm:px-3 sm:py-2 cursor-pointer">
        <DialogTrigger>
          <LanguagesIcon className="w-5 h-5" />
          <span className="hidden sm:inline">Translate</span>
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader className="flex items-center">
          <DialogTitle>Translate the Document</DialogTitle>
          <DialogDescription>
            Select a language, and AI will translate a summary of the document
            into the selected language.
          </DialogDescription>
        </DialogHeader>
          <hr className="mt-5" />

        {isPending && (
          <div className="flex items-center justify-center flex-col gap-3 p-4 rounded-lg bg-gray-100 shadow-md">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <BotIcon className="w-10 h-10 text-gray-600" />
            </motion.div>
            <p className="font-semibold text-lg text-gray-800">{funText}</p>
          </div>
        )}

        {summary && (
          <div className="flex flex-col items-start max-h-96 overflow-y-scroll gap-2 p-5 bg-gray-100 rounded-lg shadow-inner">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center">
                <BotIcon className="w-10 flex-shrink-0" />
                <p className="font-bold">Translation Result:</p>
              </div>
              <button
                type="button"
                className="ml-2 flex items-center justify-center w-8 h-8 bg-gray-200 rounded-full hover:bg-gray-300"
                aria-label="Copy Translation"
                onClick={() => {
                  copy(summary);
                  toast.success("Copied to clipboard!");
                }}
              >
                <ClipboardCopyIcon className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <Markdown>{summary}</Markdown>
          </div>
        )}

        <form className="flex gap-2 mt-5" onSubmit={handleTranslate}>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" disabled={!language || isPending}>
            {isPending ? "Translating..." : "Translate"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default TranslateDocument;
