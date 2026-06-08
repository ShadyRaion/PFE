import { Link } from "react-router-dom";
import { PlusCircle, Inbox, MessageSquare, ArrowRight, LogIn, UserPlus } from "lucide-react";
import BrandLogo from "../../components/BrandLogo";
import HeaderControls from "../../components/HeaderControls";

const features = [
  {
    icon: PlusCircle,
    title: "Create subjects",
    text: "Publish project topics for interns to apply to.",
  },
  {
    icon: Inbox,
    title: "Manage applications",
    text: "Review profiles, accept or reject applications, schedule interviews.",
  },
  {
    icon: MessageSquare,
    title: "Stay in touch",
    text: "Communicate with your assigned interns throughout the internship.",
  },
];

function SupervisorLanding() {
  return (
    <div className="min-h-screen bg-[#f1f8fc]">
      <header className="flex items-center justify-between border-b border-[#cfe1e8] bg-white px-6 py-5 sm:px-10">
        <BrandLogo size="md" />
        <HeaderControls />
      </header>

      <main className="mx-auto grid min-h-[calc(100vh-82px)] max-w-7xl items-center gap-12 px-6 py-16 sm:px-10 lg:grid-cols-2">
        <section>
          <p className="text-xs font-black uppercase tracking-widest text-cyan-700">
            Supervisor Space
          </p>

          <h1 className="mt-4 text-5xl font-black leading-tight text-slate-950 sm:text-6xl">
            Manage your project subjects.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Publish subjects, review applications, assign interns, and stay in
            touch throughout the internship.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/encadrant/login"
              className="inline-flex items-center gap-2 rounded-lg bg-cyan-700 px-6 py-3 text-sm font-bold text-white transition hover:bg-cyan-800"
            >
              <LogIn className="h-4 w-4" strokeWidth={2.5} />
              Log in
            </Link>

            <Link
              to="/encadrant/register"
              className="inline-flex items-center gap-2 rounded-lg border border-[#cfe1e8] bg-white px-6 py-3 text-sm font-bold text-[#062633] transition hover:bg-cyan-50 hover:text-cyan-700"
            >
              <UserPlus className="h-4 w-4" strokeWidth={2.5} />
              Request access
            </Link>
          </div>
        </section>

        <section className="rounded-2xl border border-[#cfe1e8] bg-white p-8 shadow-card">
          <h2 className="text-2xl font-black text-slate-950">
            Supervisor features
          </h2>

          <p className="mt-1.5 text-sm text-slate-500">
            Everything you need to run an internship program in one place.
          </p>

          <div className="mt-6 space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="flex items-start gap-4 rounded-xl border border-[#cfe1e8] bg-[#f1f8fc] p-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-cyan-700">
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-black text-slate-950">{feature.title}</p>
                    <p className="mt-0.5 text-sm leading-6 text-slate-600">
                      {feature.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Link
            to="/encadrant/login"
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-700 hover:underline"
          >
            Open the supervisor space
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </Link>
        </section>
      </main>
    </div>
  );
}

export default SupervisorLanding;
