import { Link } from 'react-router-dom';

import heroImage from '@/Assets/heroimage.png';

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
          <img src={heroImage} alt="Young shopper exploring fashion" className="h-full w-full object-contain object-right lg:w-3/4 absolute right-0 p-8 lg:p-12" />
          {/* Dark gradient strictly on the left for text readability, leaving the right side 100% clear */}
          <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-bg/95 via-bg/60 to-transparent lg:w-2/3" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl pt-10">
            <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">
              The Future of Fashion
            </p>
            <h1 className="max-w-3xl font-display text-6xl leading-[1.1] text-white sm:text-7xl lg:text-[5.5rem] lg:leading-[1.05]">
              Try It On.
              <br />
              Perfectly.
            </h1>
            <p className="mt-6 max-w-md text-base leading-relaxed text-white/80 sm:text-lg">
              Advanced WebAR technology that delivers the most accurate virtual fitting experience.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <Link
                to="/tryon"
                className="rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] px-8 py-3 text-sm font-medium text-white transition-all duration-200 hover:opacity-90 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                Try Now
              </Link>
              <Link
                to="/how-it-works"
                className="flex items-center gap-3 text-sm font-medium text-white transition-all duration-200 hover:text-white/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 transition-colors hover:border-white/50">
                  <svg className="ml-1 h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
                See How It Works
              </Link>
            </div>
          </div>

          <div className="mt-20 flex max-w-xl items-center divide-x divide-white/10 rounded-xl bg-black/20 p-6 backdrop-blur-sm border border-white/5">
            <div className="flex-1 pr-6">
              <p className="text-2xl font-semibold text-white">98.7%</p>
              <p className="mt-1 text-xs font-medium text-white/60">Fit Accuracy</p>
            </div>
            <div className="flex-1 px-6">
              <p className="text-2xl font-semibold text-white">Real-time</p>
              <p className="mt-1 text-xs font-medium text-white/60">Body Tracking</p>
            </div>
            <div className="flex-1 pl-6">
              <p className="text-2xl font-semibold text-white">AI</p>
              <p className="mt-1 text-xs font-medium text-white/60">Fit Prediction</p>
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
