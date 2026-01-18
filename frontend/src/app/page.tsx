import { redirect } from "next/navigation";
import { auth0 } from "../lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  // If logged in, redirect to the app
  if (user) {
    redirect("/app");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0e1a] text-white p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
            Axion
          </h1>
          <p className="text-xl text-gray-400 max-w-lg mx-auto">
            The modern way to manage tasks, projects, and teams. Built for high-performance engineering teams.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
          <a
            href="/auth/login"
            className="px-8 py-3 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all transform hover:scale-105 shadow-lg hover:shadow-indigo-500/25"
          >
            Get Started
          </a>
          <a
            href="https://github.com/fathurrq/axion-app"
            target="_blank"
            rel="noopener noreferrer"
            className="px-8 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-gray-200 font-semibold transition-all"
          >
            View on GitHub
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 text-left">
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl mb-2">⚡️</div>
            <h3 className="font-semibold text-lg mb-2">Lightning Fast</h3>
            <p className="text-slate-400 text-sm">Built with Next.js and optimized for speed. No loading spinners.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-lg mb-2">Stay Focused</h3>
            <p className="text-slate-400 text-sm">Distraction-free interface designed for getting things done.</p>
          </div>
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="text-2xl mb-2">👥</div>
            <h3 className="font-semibold text-lg mb-2">Team First</h3>
            <p className="text-slate-400 text-sm">Real-time collaboration and organization structure built-in.</p>
          </div>
        </div>
      </div>
    </div>
  );
}