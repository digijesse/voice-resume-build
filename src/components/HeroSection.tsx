
import { Link } from "react-router-dom";
import { useAuthState } from "../hooks/useAuthState";

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
        <img
          src="https://lovable.dev/opengraph-image-p98pqg.png"
          alt="PersonAI"
          className="max-w-xs md:max-w-sm rounded-xl shadow-lg border bg-card"
          draggable={false}
        />
      </div>
    </section>
  );
}
