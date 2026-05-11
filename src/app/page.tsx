import Link from "next/link";
import { Calendar, Activity, ArrowRight } from "lucide-react";
import { Disclaimer } from "@/components/layout/Disclaimer";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4 py-16">
      <div className="max-w-4xl w-full space-y-10">
        {/* Hero */}
        <div className="text-center space-y-4">
          <span className="inline-block text-[11px] font-semibold tracking-[0.12em] uppercase text-teal-600 bg-teal-50 px-3 py-1 rounded-full">
            Health Innovation · AI-Powered
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
            Know what to ask.{" "}
            <span className="bg-linear-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              Understand what came back.
            </span>
          </h1>
          <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
            VisitReady helps you prepare for your next doctor visit — and decode your
            results after.
          </p>
        </div>

        {/* Mode cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Mode 1 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col gap-5">
            <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Preparing for a visit
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Answer 10 questions. Get a personalized test checklist and questions
                to ask your doctor.
              </p>
            </div>
            <Link
              href="/prep"
              className="mt-auto inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 py-3 font-medium transition-colors text-sm w-fit"
            >
              Get My Panel Recommendations
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Mode 2 */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm flex flex-col gap-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Activity className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-gray-900">
                Got results back?
              </h2>
              <p className="text-gray-500 leading-relaxed">
                Paste your lab report. Understand every marker in plain English with
                an interactive body map.
              </p>
            </div>
            <Link
              href="/decode"
              className="mt-auto inline-flex items-center gap-2 border border-gray-200 hover:bg-gray-50 rounded-xl px-5 py-3 font-medium transition-colors text-sm text-gray-700 w-fit"
            >
              Decode My Results
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <Disclaimer />
      </div>
    </div>
  );
}
