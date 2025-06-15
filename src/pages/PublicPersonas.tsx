
import Layout from "../components/Layout";

const DUMMY_PERSONAS = [
  { name: "Alex Jordan", role: "Full-Stack Engineer" },
  { name: "Taylor Morgan", role: "Product Manager" },
];

export default function PublicPersonas() {
  return (
    <Layout>
      <section className="max-w-screen-lg mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-primary mb-6">Explore Public Personas</h2>

        <div className="grid gap-6 md:grid-cols-3">
          {DUMMY_PERSONAS.map((persona) => (
            <div key={persona.name} className="bg-card border rounded-lg shadow p-6 flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-muted mb-3 flex items-center justify-center text-2xl font-bold text-primary">{persona.name[0]}</div>
              <div className="font-semibold text-lg">{persona.name}</div>
              <div className="text-muted-foreground text-sm mb-4">{persona.role}</div>
              <button
                className="w-full px-4 py-2 rounded bg-primary text-primary-foreground mt-auto opacity-70 cursor-not-allowed"
                disabled
              >
                View Persona
              </button>
            </div>
          ))}
        </div>
        <div className="text-center text-muted-foreground mt-10 text-lg">
          Public personas coming soon! For now, create your own.
        </div>
      </section>
    </Layout>
  );
}
