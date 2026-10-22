import { lang } from "next/root-params";
import { getDictionary } from "./dictionaries";
import Hero from "./_components/Hero";
import About from "./_components/About";
import Steps from "./_components/Steps";
import Season from "./_components/Season";
import Faq from "./_components/Faq";

export async function generateMetadata() {
  return {
    alternates: {
      canonical: `/${await lang()}`,
      languages: { fr: "/fr", en: "/en", "x-default": "/fr" },
    },
  };
}

export default async function Home() {
  const dict = await getDictionary();

  return (
    <main>
      <Hero dict={dict} />
      <About dict={dict} />
      <Steps dict={dict} />
      <Season dict={dict} />
      <Faq dict={dict} />
    </main>
  );
}
