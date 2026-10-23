import Image from "next/image";
import Reveal from "@/components/Reveal";

const marks = [
  "left-[8%] top-[6%] text-8xl float-delay-1",
  "right-[10%] top-[14%] text-9xl float-delay-3",
  "left-[16%] bottom-[12%] text-7xl float-delay-2",
  "right-[18%] bottom-[4%] text-8xl float-delay-4",
];

export default function Faq({ dict }) {
  const f = dict.faq;

  return (
    <section id="faq" className="relative scroll-mt-16 overflow-clip px-4 py-24 sm:px-8 lg:px-12">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.4fr]">
        <Reveal from="zoom" className="relative hidden h-96 lg:block">
          <Image src="/brand/logo-icon-night.svg" alt="" aria-hidden="true" fill className="animate-drift object-contain opacity-[0.07]" />
          {marks.map((pos) => (
            <span key={pos} aria-hidden="true" className={`text-ghost animate-float absolute font-display font-bold ${pos}`}>
              ?
            </span>
          ))}
        </Reveal>

        <Reveal from="right">
          <h2 className="mb-8 font-display text-4xl font-bold uppercase sm:text-5xl">{f.title}</h2>
          <div className="space-y-3">
            {f.items.map((item, i) => (
              <details key={item.q} open={i === 0} className="chamfer-sm group bg-night/5 transition-colors open:bg-night open:text-offwhite">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 font-semibold [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <svg viewBox="0 0 24 24" className="size-5 shrink-0 text-accent transition-transform duration-300 group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="intro px-6 pb-5 text-sm leading-relaxed text-offwhite/70">{item.a}</p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
