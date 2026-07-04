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

const highlights = [
  'Live fit previews before checkout',
  'Cinematic, body-aware garment mapping',
  'Built for the way young Nepal shops online',
];

export default function Home() {
  return (
    <div className="min-h-screen bg-bg text-offwhite">
      <section className="relative isolate overflow-hidden border-b border-border/80">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Young shopper exploring fashion" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-bg/82" />
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/90 to-bg/40" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-between px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-3xl pt-10">
            <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
              Made For Nepal's Rising Generation
            </p>
            <h1 className="max-w-3xl font-display text-5xl leading-[0.9] text-offwhite sm:text-6xl lg:text-7xl">
              Try it on.
              <br />
              <span className="text-offwhite/90">Before it's yours.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
              A virtual fitting room built for how young Nepal actually shops. Stand in front of your camera and see the fit come to life — shaped around your body, live.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/tryon"
                className="border border-accent bg-accent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-bg transition-all duration-200 hover:bg-accent/90"
              >
                Start Now
              </Link>
              <Link
                to="/community"
                className="border border-white/20 bg-transparent px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-offwhite transition-all duration-200 hover:border-accent hover:text-accent"
              >
                See the community
              </Link>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm text-white/70 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.35em] text-accent">Now streaming</p>
              <p className="mt-1 text-offwhite">Real-time fit preview, no guesswork.</p>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px] uppercase tracking-[0.28em]">
              {highlights.map((item) => (
                <span key={item} className="border border-white/10 px-3 py-2 text-white/70">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="border border-border/80 bg-offwhite p-8 text-bg">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent-dark">The Gap We Noticed</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              A picture never told the whole story.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-bg/70">
              Every fashion site shows the same setup — a product photo, a generic size chart, and a model built nothing like you. For young men shopping online across Nepal, that disconnect runs even deeper.
            </p>
            <p className="mt-4 text-base leading-relaxed text-bg/70">
              So you size up, hope for the best, and often get it wrong — then deal with a return process that is more painful than just waiting.
            </p>
            <div className="mt-8 border-t border-bg/15 pt-6 text-[11px] font-semibold uppercase tracking-[0.3em] text-bg/60">
              No more guessing games.
            </div>
          </article>

          <div className="space-y-6">
            {storySections.slice(1).map((section) => (
              <article key={section.title} className="border border-border/80 bg-card/80 p-7">
                <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">{section.eyebrow}</p>
                <h3 className="mt-3 font-display text-2xl leading-tight text-offwhite">{section.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{section.body}</p>
                {section.bullets && (
                  <ul className="mt-5 space-y-2 text-sm text-white/75">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-center gap-2">
                        <span className="h-2 w-2 bg-accent" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
          </div>
        </div>

        <section className="mt-16 border-t border-border/80 pt-12">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">A New Standard</p>
              <h3 className="mt-3 font-display text-3xl leading-tight text-offwhite sm:text-4xl">
                Structured, severe, and quietly luxurious.
              </h3>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                ['01', 'Monochrome discipline', 'A strict black, white, and gold system with no decorative excess.'],
                ['02', 'Architectural rhythm', 'Sharp edges and deliberate spacing create a premium editorial feel.'],
                ['03', 'Quiet motion', 'Minimal animation that feels precise rather than playful.'],
              ].map(([number, title, copy]) => (
                <div key={title} className="border border-border/80 bg-card/70 p-5">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">{number}</p>
                  <h4 className="mt-3 text-lg font-semibold text-offwhite">{title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-white/65">{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/80 bg-bg/95 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-display text-xl text-offwhite">Nepal's fitting room, built around you.</p>
          <p className="text-[11px] uppercase tracking-[0.3em] text-accent">Luxury fashion-tech, without the noise.</p>
        </div>
      </footer>
    </div>
  );
}
