import Reveal from "@/components/Reveal";
import { revealDelays } from "@/lib/motion";

// The next event is highlighted in orange; the rest alternate night/graphite.
const tones = ["bg-accent", "bg-night", "bg-graphite", "bg-night", "bg-graphite", "bg-night"];

export default function Season({ dict }) {
  const s = dict.season;

  return (
    <section id="season" className="scroll-mt-16 px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">
        <Reveal as="h2" from="left" className="mb-10 font-display text-4xl font-bold uppercase sm:text-5xl">
          {s.title}
        </Reveal>
        <ol className="grid gap-5 md:grid-cols-2">
          {s.items.map((item, i) => (
            <Reveal as="li" key={item.name} from={i % 2 ? "right" : "left"} className={revealDelays[i % 2 ? 2 : 0]}>
              <article className={`chamfer shine group relative flex h-56 flex-col justify-between overflow-clip p-6 text-offwhite transition-transform duration-500 hover:-translate-y-1 ${tones[i % tones.length]}`}>
                <span aria-hidden="true" className="absolute -right-6 top-0 h-full w-24 skew-x-[-20deg] border-x-[14px] border-offwhite/15 transition-transform duration-500 group-hover:translate-x-3" />
                <div className="relative flex items-start gap-4">
                  <span className="font-display text-7xl font-bold leading-none text-offwhite/30">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mt-2 bg-offwhite/10 px-3 py-1 font-display text-sm font-bold uppercase tracking-wider">{s.label}</span>
                </div>
                <div className="relative">
                  <h3 className="border-b border-offwhite/20 pb-2 font-display text-xl font-bold">
                    <span aria-hidden="true" className="mr-2 text-offwhite/60">✦</span>
                    {item.name}
                  </h3>
                  <p className="mt-2 font-display font-bold">{item.date}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
