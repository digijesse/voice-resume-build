
import { ArrowRight } from "lucide-react";

const steps = [
  { title: "Upload Resume", desc: "PDF, DOCX, or TXT. Let your experience shine." },
  { title: "Enter API Keys", desc: "OpenAI & ElevenLabs for AI voice magic." },
  { title: "Set Public/Private", desc: "Control if your PersonAI is shareable." },
  { title: "Speak & Share", desc: "Interact with your AI. Share your page." },
];

export default function HowItWorksSection() {
  return (
    <section className="w-full bg-muted py-8 md:py-12 fixed bottom-0 left-0">
      <div className="max-w-screen-lg mx-auto px-6 flex flex-col md:flex-row md:items-center gap-8">
        <div className="min-w-[170px] text-2xl font-bold mb-4 md:mb-0 text-primary">
          How it Works
        </div>
        <ul className="flex flex-col md:flex-row gap-6 w-full items-center md:items-stretch">
          {steps.map((item, idx) => (
            <li key={item.title} className="bg-card rounded-lg shadow-sm p-4 md:p-5 flex flex-col items-center text-center border flex-1 relative">
              <span className="text-lg font-semibold mb-1">{item.title}</span>
              <span className="text-sm text-muted-foreground">{item.desc}</span>
              {idx < steps.length - 1 && (
                <span className="hidden md:block absolute right-[-22px] top-1/2 -translate-y-1/2">
                  <ArrowRight className="w-7 h-7 text-muted-foreground" />
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
