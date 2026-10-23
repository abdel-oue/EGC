import Image from "next/image";
import Reveal from "@/components/Reveal";

// Placeholder block for sections whose content doesn't exist yet.
export default function EmptyState({ title, text, children }) {
  return (
    <Reveal from="zoom" className="hud-corners mx-auto max-w-2xl bg-night/5 px-8 py-14 text-center">
      <Image src="/brand/logo-icon.svg" alt="" width={80} height={80} className="animate-float mx-auto h-auto w-20" />
      <h2 className="mt-6 font-display text-2xl font-bold uppercase">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-night/60">{text}</p>
      {children && <div className="mt-8 flex flex-wrap justify-center gap-4">{children}</div>}
    </Reveal>
  );
}
