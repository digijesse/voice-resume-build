
// Home/Landing Page with hero, tagline, CTA, how it works section, using Layout.
import { Link } from "react-router-dom";
import Layout from "../components/Layout";

const howItWorks = [
  { title: "Upload Resume", desc: "Share your background in PDF, DOCX, or TXT." },
  { title: "Enter API Keys", desc: "Securely provide OpenAI and ElevenLabs keys." },
  { title: "Speak & Share", desc: "Interact with your AI persona, share with the world." },
  { title: "Control Privacy", desc: "Decide what’s public or private anytime." },
];

export default function Index() {
  return (
    <Layout>
      <section className="flex flex-col lg:flex-row items-center px-6 py-16 gap-12 max-w-screen-xl mx-auto">
        <div className="flex-1 space-y-7 text-center lg:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary">
            Your Voice, Your Resume, <br className="hidden md:inline" />
            Your <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">Professional Persona</span>.
          </h1>
          <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto lg:mx-0">
            Transform your work history and expertise into an interactive, AI-powered profile. Let your accomplishments speak for themselves—literally.
          </p>
          <div className="mt-8">
            <Link
              to="/create"
              className="inline-block px-8 py-4 text-lg rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow transition"
            >
              Create Your Persona Now
            </Link>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img
            src="https://lovable.dev/opengraph-image-p98pqg.png"
            alt="Persona Illustration"
            className="max-w-xs md:max-w-sm rounded-xl shadow-lg border bg-card"
            draggable={false}
          />
        </div>
      </section>

      <section className="w-full bg-muted py-12">
        <div className="max-w-screen-lg mx-auto px-6 flex flex-col md:flex-row md:items-center gap-8">
          <div className="min-w-[170px] text-2xl font-bold mb-4 md:mb-0 text-primary">
            How it Works
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
            {howItWorks.map((item, idx) => (
              <li key={item.title} className="bg-card rounded-lg shadow-sm p-5 flex flex-col items-center text-center border flex-1">
                <span className="text-lg font-semibold mb-1">{item.title}</span>
                <span className="text-sm text-muted-foreground">{item.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Layout>
  );
}
