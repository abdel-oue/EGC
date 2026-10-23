import Image from "next/image";
import Socials from "@/components/Socials";

export default function Footer({ dict }) {
  return (
    <footer className="border-t border-night/10 px-4 py-12 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 md:flex-row md:items-center">
        <Image src="/brand/logo-full-night.svg" alt="ESISA Gaming Club" width={180} height={75} className="h-auto w-40" />
        <p className="text-sm text-night/60">
          {dict.footer.place}
          <br />© ESISA Gaming Club. {dict.footer.rights}
        </p>
        <Socials tileClass="bg-night text-offwhite hover:bg-accent" />
      </div>
    </footer>
  );
}
