// Home/Landing Page with hero, tagline, CTA, how it works section, using Layout.
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import NavBar from "../components/NavBar";
import HeroSection from "../components/HeroSection";
import HowItWorksSection from "../components/HowItWorksSection";

const howItWorks = [
  { title: "Upload Resume", desc: "Share your background in PDF, DOCX, or TXT." },
  { title: "Enter API Keys", desc: "Securely provide OpenAI and ElevenLabs keys." },
  { title: "Speak & Share", desc: "Interact with your AI persona, share with the world." },
  { title: "Control Privacy", desc: "Decide what’s public or private anytime." },
];

export default function Index() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b bg-white/90 sticky top-0 z-20">
        <NavBar />
      </header>
      <main className="flex-1 w-full flex flex-col">
        <HeroSection />
      </main>
      <HowItWorksSection />
    </div>
  );
}
