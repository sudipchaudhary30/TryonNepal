import { Link } from 'react-router-dom';

import heroImage from '@/Assets/heroimage.jpg';

const storySections = [
  {
    eyebrow: 'The Gap We Noticed',
    title: 'A picture never told the whole story.',
    body:
      'Every fashion site shows the same setup — a product photo, a generic size chart, and a model built nothing like you. For young men shopping online across Nepal, that disconnect runs even deeper.',
  },
  {
    eyebrow: 'Under the Hood',
    title: 'Real body. Real fit. Real time.',
    body:
      'Switch on your camera. The system reads your stance, your proportions, and your movement — then shapes the garment around you, not a mannequin built around someone else.',
    bullets: ['Capture', 'Match', 'Preview'],
  },
  {
    eyebrow: 'Made With You in Mind',
    title: 'Designed for young men, 18 to 28, shopping online across Nepal.',
    body:
      'You are one of the most active online shoppers today — yet you have had the least influence over how that experience is built. This closes that gap around how you shop and who you are.',
  },
  {
    eyebrow: 'What Changes',
    title: 'Stop guessing. Start knowing.',
    body:
      'Fewer returns. Fewer surprises. A fitting room that actually reflects you — not a model, not a mannequin, not a stand-in for your body.',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Young shopper exploring fashion" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/75" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/30" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.25em] text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </span>
              Made For Nepal's Rising Generation
            </div>

            <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-8xl">
              Try it on. <br />
              <span className="bg-gradient-to-r from-accent via-white to-white bg-clip-text text-transparent">Before it's yours.</span>
            </h1>

            <p className="max-w-2xl text-base leading-relaxed text-slate-200/90 sm:text-lg">
              A virtual fitting room built for how young Nepal actually shops. Stand in front of your camera and see the fit come to life — shaped around your body, live.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/tryon"
                className="rounded-full bg-accent px-8 py-4 font-bold text-black shadow-lg shadow-accent/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-accent/35"
              >
                Start Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/20 backdrop-blur-md">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent">The Gap We Noticed</p>
            <h2 className="mt-3 font-display text-3xl font-bold leading-snug text-white">
              A picture never told the whole story.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Every fashion site shows the same setup — a product photo, a generic size chart, and a model built nothing like you. For young men shopping online across Nepal, that disconnect runs even deeper.
            </p>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              So you size up, hope for the best, and often get it wrong — then deal with a return process that is more painful than just waiting.
            </p>
          </article>

          <div className="space-y-6">
            {storySections.slice(1).map((section) => (
              <article key={section.title} className="rounded-3xl border border-white/10 bg-slate-900/70 p-7 backdrop-blur-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-accent/80">{section.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold text-white">{section.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{section.body}</p>
                {section.bullets && (
                  <ul className="mt-5 space-y-2 text-sm text-slate-200">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-white/10 bg-slate-950/80 px-4 py-12 text-center sm:px-6 lg:px-8">
        <p className="text-xl font-semibold italic text-slate-200 sm:text-2xl">
          Nepal's fitting room, built around you.
        </p>
      </footer>
    </div>
  );
}
