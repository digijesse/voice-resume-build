
import { Link } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";
import { AnimatedTestimonials } from "./ui/animated-testimonials";

const testimonials = [
  {
    quote: "Building the future of AI development, one line of code at a time. Innovation happens when we dare to think differently.",
    name: "Anton Osika",
    designation: "Founder & CEO at Lovable",
    src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    agentId: "agent_01jxtq7s4ef6qsjehxsz2wps91"
  },
  {
    quote: "The key to AGI is not just intelligence, but understanding how to align it with human values and create beneficial outcomes for all.",
    name: "Sam Altman",
    designation: "CEO at OpenAI",
    src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    agentId: "agent_01jxtqzq68ec5bp6726j7chsv4"
  },
  {
    quote: "We're at the dawn of a new era. AI, sustainable energy, and space exploration will define humanity's future. Let's make it extraordinary.",
    name: "Elon Musk",
    designation: "CEO at Tesla, SpaceX & xAI",
    src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3",
    agentId: "agent_01jxts4n6se9brwv0v8nv304hb"
  }
];

export default function HeroSection() {
  const { user } = useAuthState();

  return (
    <section className="flex flex-col lg:flex-row items-center px-6 py-16 gap-12 max-w-screen-xl mx-auto min-h-[60vh]">
      <div className="flex-1 space-y-7 text-center lg:text-left">
        <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-primary">
          Your Work. <br className="hidden md:inline" />
          Your&nbsp;
          <span className="bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
            PersonAI
          </span>
          .
        </h1>
        <p className="text-xl text-muted-foreground font-medium max-w-lg mx-auto lg:mx-0">
          Instantly turn your resume and expertise into an AI-powered profile. Your accomplishments, as an interactive persona—voice included.
        </p>
        <div className="mt-8 flex gap-4 justify-center lg:justify-start">
          <Link
            to={user ? "/create" : "/auth"}
            className="px-8 py-4 text-lg rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 shadow transition"
          >
            Create Persona
          </Link>
          <Link
            to="/personas"
            className="px-8 py-4 text-lg rounded-lg font-semibold bg-white text-primary shadow border hover:bg-muted transition"
          >
            Public PersonAIs
          </Link>
        </div>
      </div>
      <div className="flex-1 flex justify-center items-center">
        <AnimatedTestimonials testimonials={testimonials} />
      </div>
    </section>
  );
}
