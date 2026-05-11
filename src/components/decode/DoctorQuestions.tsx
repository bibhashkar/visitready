"use client";

import { Quote, Copy, Check } from "lucide-react";
import { useState } from "react";

interface DoctorQuestionsProps {
  questions: string[];
  title?: string;
}

export function DoctorQuestions({
  questions,
  title = "Questions to ask your doctor",
}: DoctorQuestionsProps) {
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <button
          onClick={copyAll}
          className="flex items-center gap-1.5 text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              Copy all
            </>
          )}
        </button>
      </div>

      <ul className="space-y-3">
        {questions.map((q, i) => (
          <li
            key={i}
            className="flex gap-3 rounded-xl bg-white border border-gray-100 p-4 shadow-sm"
          >
            <Quote className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" />
            <span className="text-sm text-gray-700 leading-relaxed">{q}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
