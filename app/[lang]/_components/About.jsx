import Image from "next/image";
import Reveal from "@/components/Reveal";
import { games } from "@/lib/site";
import { floatDelays } from "@/lib/motion";

const tiles = [...games.map((g) => g.key), "discord"];

export default function About({ dict }) {
  const a = dict.about;

  return (
    <section id="about" className="relative scroll-mt-16 overflow-clip px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-2">
        <Reveal from="left">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.3em] text-accent">{a.label}</h2>
          <p aria-hidden="true" className="text-ghost -mt-2 select-none font-display text-[clamp(6rem,18vw,11rem)] font-bold leading-none">
            {a.ghost}
          </p>
          <p className="-mt-4 font-display text-2xl font-bold">{a.lead}</p>
          <p className="mt-4 leading-relaxed text-night/70">{a.p1}</p>
          <p className="mt-8 font-display text-xl font-bold">{a.h2}</p>
          <p className="mt-4 leading-relaxed text-night/70">{a.p2}</p>
          <p className="mt-8 border-l-2 border-accent pl-4 font-display text-lg font-bold">{a.closing}</p>
        </Reveal>

        <Reveal from="right" className="hud-corners mx-auto aspect-square w-full max-w-md">
          <div aria-hidden="true" className="animate-glow absolute inset-12 rounded-full bg-accent/25 blur-3xl" />
          <Image src="/brand/logo-icon.svg" alt="" width={420} height={420} className="animate-drift relative mx-auto h-auto w-4/5 pt-6" />
          <ul className="absolute inset-x-0 -bottom-4 flex -rotate-6 justify-center gap-3">
            {tiles.map((key, i) => (
              <li key={key} className={`chamfer-sm animate-float bg-night p-3 shadow-lg ${floatDelays[i % floatDelays.length]}`}>
                <Image src={`/brand/games/${key}.svg`} alt="" width={40} height={40} className="size-8 sm:size-10" />
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
