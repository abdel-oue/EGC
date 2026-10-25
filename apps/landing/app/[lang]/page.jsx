import { lang } from "next/root-params";
import Faq from "@/components/Faq";
import Season from "@/components/Season";
import Steps from "@/components/Steps";
import { alternates } from "@/lib/seo";
import { getDictionary } from "./dictionaries";
import Hero from "./_components/Hero";
import About from "./_components/About";

export async function generateMetadata() {
  return { alternates: alternates(await lang(), "") };
}

export default async function Home() {
  const locale = await lang();
  const dict = await getDictionary();

  return (
    <main>
      <Hero lang={locale} dict={dict} />
      <Season dict={dict} limit={3} />
      <About dict={dict} />
      <Steps dict={dict} />
      <Faq dict={dict} />
    </main>
  );
}
