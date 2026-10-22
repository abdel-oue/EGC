import Carousel from "@/components/Carousel";
import HudButton from "@/components/HudButton";
import Reveal from "@/components/Reveal";
import { socials } from "@/lib/site";
import { revealDelays } from "@/lib/motion";

export default function Steps({ dict }) {
  const s = dict.steps;

  return (
    <section id="join" className="relative scroll-mt-16 overflow-clip bg-night px-4 py-24 text-offwhite [--ghost:rgb(245_243_239/0.15)] sm:px-8 lg:px-12">
      <div aria-hidden="true" className="bg-grid absolute inset-0 opacity-20 invert" />
      <div className="relative mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_2fr]">
        <Reveal from="left">
          <h2 className="font-display font-bold uppercase leading-none">
            <span aria-hidden="true" className="text-ghost block text-5xl sm:text-6xl">
              {s.ghost}
            </span>
            <span className="sr-only">{s.ghost} </span>
            <span className="block text-4xl sm:text-5xl">{s.title}</span>
          </h2>
          <HudButton href={socials.discord} className="mt-10">
            {s.cta}
          </HudButton>
        </Reveal>

        <Carousel prevLabel={s.prev} nextLabel={s.next} className="min-w-0" heading={<span />}>
          {s.items.map((item, i) => (
            <Reveal key={item.title} from="right" className={`shrink-0 snap-start ${revealDelays[i]}`}>
              <article className="chamfer group relative flex min-h-44 w-72 flex-col justify-end bg-graphite p-6 pr-24 transition-colors duration-300 hover:bg-offwhite/10">
                <div className="chamfer-sm absolute right-4 top-4 grid size-16 place-items-center bg-accent text-center font-display leading-none transition-transform duration-300 group-hover:-translate-y-1">
                  <span className="text-2xl font-bold">0{i + 1}</span>
                  <span className="-mt-3 text-[0.6rem] font-bold uppercase tracking-widest">{s.step}</span>
                </div>
                <h3 className="font-display text-lg font-bold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-offwhite/60">{item.text}</p>
              </article>
            </Reveal>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
