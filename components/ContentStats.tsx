"use client";

import { useState, useEffect } from "react";
import { getContentStats, formatContentStats } from "@/lib/contentLimits";
import { APP_LIMITS } from "@/lib/limits";
import { FileText, AlertTriangle } from "lucide-react";

interface ContentStatsProps {
  content: string;
  className?: string;
}

function ContentStats({ content, className = "" }: ContentStatsProps) {
  const [stats, setStats] = useState({ wordCount: 0, charCount: 0 });

  useEffect(() => {
    const newStats = getContentStats(content);
    setStats(newStats);
  }, [content]);

  const isNearLimit = stats.wordCount > APP_LIMITS.MAX_WORDS_PER_DOC * 0.8;
  const isOverLimit = stats.wordCount > APP_LIMITS.MAX_WORDS_PER_DOC;

  return (
    <div className={`flex items-center gap-2 text-xs text-gray-500 ${className}`}>
      <FileText className="w-3 h-3" />
      <span className={`
        ${isOverLimit ? 'text-red-500 font-medium' : ''}
        ${isNearLimit ? 'text-yellow-600 font-medium' : ''}
      `}>
        {formatContentStats(stats.wordCount, stats.charCount)}
      </span>
      {isOverLimit && (
        <AlertTriangle className="w-3 h-3 text-red-500" />
      )}
    </div>
  );
}

export default ContentStats;
