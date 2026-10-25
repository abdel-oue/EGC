import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(import.meta.dirname, "..");
const source = path.join(root, "structure/Insta/team-members");
const content = JSON.parse(await readFile(path.join(source, "content.json"), "utf8"));
const output = path.join(root, "packages/shared/preview-media");
await mkdir(output, { recursive: true });

// Web-sized WebP copies keep pages light; originals stay in structure/.
function toWebp(input, file, width) {
  return sharp(input).rotate().resize({ width, withoutEnlargement: true })
    .webp({ quality: 80 }).toFile(path.join(output, file));
}

const englishRoles = [
  "President", "Vice President", "Treasurer", "Secretary",
  "Communications & Content Lead", "Logistics Lead", "Minecraft Lead",
  "Operations Officer", "Operations Officer", "Operations Officer",
];
const members = [];

for (const slide of content.slides.filter((item) => item.type === "member")) {
  const filename = `${slide.id}.webp`;
  await toWebp(path.join(source, slide.member.photo), filename, 900);
  members.push({
    id: slide.id,
    name: slide.member.name,
    role_fr: slide.member.role,
    role_en: englishRoles[members.length],
    image_path: filename,
    photo_offset_y: slide.member.photo_offset_y,
    sort_order: members.length,
    visible: true,
  });
}

const media = [
  {
    id: "valorant-october-promotion",
    game: "valorant",
    caption_fr: "Tournoi Valorant — Skirmish 2v2",
    caption_en: "Valorant tournament — Skirmish 2v2",
    image_path: "valorant-october.webp",
    kind: "promotion",
    sort_order: 0,
    visible: true,
  },
];

await toWebp(path.join(root, "structure/Insta/Valorant-24-10/valorant-landscape-white.png"), media[0].image_path, 1600);

await writeFile(
  path.join(root, "packages/shared/initial-content.json"),
  JSON.stringify({ members, media }, null, 2) + "\n"
);
