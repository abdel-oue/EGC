import Image from "next/image";
import HudButton from "@/components/HudButton";
import Reveal from "@/components/Reveal";

// Dark banner pointing to a game's team registration form.
export default function OpenRegistration({ href, gameKey, label, title, text, cta }) {
  return (
    <Reveal>
      <article className="chamfer shine group relative grid items-center gap-6 overflow-clip bg-night p-8 text-offwhite sm:grid-cols-[auto_1fr_auto]">
        <span aria-hidden="true" className="absolute -right-12 top-0 h-full w-28 skew-x-[-20deg] bg-accent transition-transform duration-500 group-hover:translate-x-4" />
        <Image src={`/brand/games/${gameKey}.svg`} alt="" width={96} height={96} className="animate-float relative size-24" />
        <div className="relative">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-accent">{label}</p>
          <h2 className="mt-1 font-display text-3xl font-bold uppercase">{title}</h2>
          <p className="mt-2 max-w-xl text-offwhite/70">{text}</p>
        </div>
        <HudButton href={href} className="relative justify-self-start sm:mr-12">
          {cta}
        </HudButton>
      </article>
    </Reveal>
  );
}
