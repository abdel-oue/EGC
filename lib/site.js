export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// TODO: replace "#" with the real invite / profile links, and set the club email.
export const socials = {
  instagram: "https://www.instagram.com/esisagamingclub",
  discord: "#",
  linkedin: "#",
};
export const email = "";

// `registration` = team sign-ups are open for this game (adds /[lang]/teams/register/<key>).
export const games = [
  {
    key: "valorant",
    name: "Valorant",
    registration: {
      players: 5,
      subs: 1,
      ranks: ["iron", "bronze", "silver", "gold", "platinum", "diamond", "ascendant", "immortal", "radiant"],
    },
  },
  { key: "league", name: "League of Legends" },
  { key: "fc", name: "EA Sports FC" },
  { key: "minecraft", name: "Minecraft" },
];
