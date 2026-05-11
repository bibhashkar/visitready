"use client";

import { useState } from "react";
import { LabInput } from "@/components/decode/LabInput";
import { Disclaimer } from "@/components/layout/Disclaimer";

export default function DecodePage() {
  const [contextChoice, setContextChoice] = useState<boolean | null>(null);

  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10">
      <div className="mb-8 space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-teal-600">
          Results Decoder
        </p>
        <h1 className="text-3xl font-bold text-gray-900">
          Paste your lab report
        </h1>
        <p className="text-gray-500 text-sm">
          Copy the text from your patient portal (MyChart, LabCorp, Quest, etc.) and
          we&apos;ll explain every marker in plain English.
        </p>
      </div>

      <LabInput useContext={contextChoice} onContextChoice={setContextChoice} />
      <Disclaimer />
    </div>
  );
}
