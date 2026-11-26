import Image from "next/image";

// Official full logo (icon + "ESISA Gaming Club"); the surrounding link or page title carries the name.
export default function AdminBrand() {
  return <Image src="/brand/logo-full.svg" alt="" width={1278} height={542} priority className="admin-brand" />;
}
