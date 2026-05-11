import { IntakeForm } from "@/components/prep/IntakeForm";
import { Disclaimer } from "@/components/layout/Disclaimer";

export default function PrepPage() {
  return (
    <div className="max-w-2xl mx-auto w-full px-4 py-10">
      <div className="mb-8 space-y-1">
        <p className="text-xs font-medium uppercase tracking-widest text-teal-600">
          Pre-Visit Prep
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Build your panel
        </h1>
        <p className="text-gray-500 text-sm">
          Answer the questions below and we&apos;ll generate a personalized blood test
          checklist and questions to bring to your doctor.
        </p>
      </div>

      <IntakeForm />
      <Disclaimer />
    </div>
  );
}
