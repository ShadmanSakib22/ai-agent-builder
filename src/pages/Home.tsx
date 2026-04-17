import {
  Rocket,
  ShieldCheck,
  Database,
  AlertCircle,
  Terminal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <div className="container mx-auto max-w-5xl px-6 py-12 space-y-16">
      {/* Hero Section */}
      <section className="flex flex-col items-center text-center space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground">
          Architect your next <span className="text-primary">AI Agent</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          The ultimate profile builder for AI agents. Create, test, and store
          blueprints locally in your browser before deploying to production.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => navigate("/builder")}
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-semibold flex items-center gap-2 transition-all shadow-lg shadow-primary/20"
          >
            Get Started <Rocket size={18} />
          </button>
          <a
            href="https://github.com/ShadmanSakib22/ai-agent-builder"
            className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-8 py-3 rounded-md font-medium transition-all"
          >
            View on GitHub
          </a>
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <Database className="text-primary mb-4" size={28} />
          <h3 className="text-lg font-semibold text-card-foreground">
            Local Storage
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Blueprints are saved to your browser's local storage. Nothing is
            sent to our servers, giving you full control and privacy over your
            agent designs.
          </p>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <ShieldCheck className="text-primary mb-4" size={28} />
          <h3 className="text-lg font-semibold text-card-foreground">
            BYO Provider Key
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Security first. Deploy your agents using your own API keys for full
            privacy control.
          </p>
        </div>
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-colors">
          <Terminal className="text-primary mb-4" size={28} />
          <h3 className="text-lg font-semibold text-card-foreground">
            Open Source
          </h3>
          <p className="text-sm text-muted-foreground mt-2">
            Built for the community. Access the full source code and
            documentation on GitHub.
          </p>
        </div>
      </section>

      {/* Disclaimer Section */}
      <section className="rounded-lg border border-border bg-muted/40 p-6">
        <div className="flex gap-4 items-start">
          <AlertCircle
            className="text-muted-foreground mt-1 shrink-0"
            size={20}
          />
          <div className="space-y-2">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-widest">
              Notice
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
              This is a prototype web app for AI Agent Profile Builder. Test
              with the playground account setup. Blueprints are stored in the
              browser local storage. This is a prototype and may not be fully
              functional or secure. Use it at your own risk.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
