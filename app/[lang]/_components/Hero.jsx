import Image from "next/image";
import Link from "next/link";
import Carousel from "@/components/Carousel";
import HudButton from "@/components/HudButton";
import { games } from "@/lib/site";
import { floatDelays } from "@/lib/motion";

export default function Hero({ lang, dict }) {
  const h = dict.hero;
  const g = dict.games;

  return (
    <section id="home" className="bg-grid relative isolate flex min-h-svh items-end overflow-clip px-4 pb-16 pt-24 sm:px-8 lg:px-12 lg:pt-32">
      <div aria-hidden="true" className="animate-glow pointer-events-none absolute -right-40 top-0 -z-10 size-[640px] rounded-full bg-accent/15 blur-3xl" />
      <Image
        src="/brand/logo-icon-night.svg"
        alt=""
        aria-hidden="true"
        width={640}
        height={640}
        priority
        className="animate-drift pointer-events-none absolute -left-24 top-8 -z-10 h-auto w-[min(85vw,640px)] opacity-[0.06]"
      />

      <div className="mx-auto grid w-full max-w-6xl items-end gap-14 xl:grid-cols-2">
        <div>
          <p className="intro intro-1 mb-6 flex items-center gap-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">
            <span className="animate-sweep h-px w-10 bg-accent" />
            {h.kicker}
          </p>
          <h1 className="font-display font-bold uppercase leading-[0.95] tracking-tight">
            <span className="intro intro-2 block text-3xl sm:text-4xl">{h.line1}</span>
            <span className="intro intro-3 flex items-center gap-3 text-4xl sm:text-6xl">
              {h.line2}
              <span className="text-sm leading-tight text-accent sm:text-lg">
                {h.side1}
                <br />
                {h.side2}
              </span>
            </span>
            <span className="intro intro-4 block text-4xl sm:text-6xl">{h.line3}</span>
          </h1>
          <p className="intro intro-5 mt-6 text-lg text-night/60">{h.tagline}</p>
          <div className="intro intro-6 mt-10 flex flex-wrap gap-4">
            <HudButton href={`/${lang}/join`}>{h.cta}</HudButton>
            <HudButton href="#season" variant="outline">
              {h.secondary}
            </HudButton>
          </div>
        </div>

        <div id="games" className="intro intro-5 min-w-0 scroll-mt-24">
          <Carousel
            prevLabel={g.prev}
            nextLabel={g.next}
            heading={
              <h2 className="font-display font-bold uppercase leading-none">
                <span className="block text-xs tracking-[0.3em] text-accent">{g.kicker}</span>
                <span className="text-4xl">{g.title}</span>
              </h2>
            }
          >
            {games.map((game, i) => (
              <Link
                key={game.key}
                href={game.registration ? `/${lang}/teams/register/${game.key}` : `/${lang}/teams`}
                className="chamfer shine group relative flex h-80 w-56 shrink-0 snap-start flex-col justify-between overflow-clip bg-night p-5 text-offwhite transition-transform duration-500 hover:-translate-y-2"
              >
                <span aria-hidden="true" className="absolute -right-10 top-0 h-full w-20 skew-x-[-20deg] bg-accent transition-transform duration-500 group-hover:translate-x-4" />
                <span aria-hidden="true" className="absolute right-14 top-0 h-full w-5 skew-x-[-20deg] bg-graphite transition-transform duration-500 group-hover:-translate-x-2" />
                <span className="relative font-display text-xs font-bold tracking-[0.3em] text-offwhite/40">0{i + 1}</span>
                <span className="relative mx-auto transition-transform duration-500 group-hover:scale-110">
                  <Image src={`/brand/games/${game.key}.svg`} alt="" width={144} height={144} className={`animate-float size-36 ${floatDelays[i % floatDelays.length]}`} />
                </span>
                <span className="relative">
                  <span className="block font-display text-lg font-bold uppercase leading-tight">{game.name}</span>
                  <span className="mt-3 flex items-center justify-between border-t border-offwhite/15 pt-3 text-xs font-bold uppercase tracking-wider text-offwhite/60 transition-colors group-hover:text-accent">
                    {g.join}
                    <span aria-hidden="true">→</span>
                  </span>
                </span>
              </Link>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
