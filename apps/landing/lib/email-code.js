// Relative import so node:test can load this module too.
import { socials } from "./site.js";

// Registration codes: HMAC-SHA256(secret, "email:eventId:slot"), first 32 bits mod 1e6.
// Must match public.registration_code() in supabase/migrations/20261124000000_verified_registrations.sql.

export function codeSlot(now = Date.now()) {
  return Math.floor(now / 600000);
}

export async function registrationCode(secret, email, eventId, slot) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(`${email}:${eventId}:${slot}`));
  return String(new DataView(signature).getUint32(0) % 1000000).padStart(6, "0");
}

const escape = (value) => String(value).replace(/[&<>"']/g, (char) => `&#${char.charCodeAt(0)};`);

const colors = { offwhite: "#F5F3EF", night: "#0E0E10", accent: "#E35205", graphite: "#2A2A2E", muted: "#6B6B70" };
const display = "'Space Grotesk', Arial, Helvetica, sans-serif";
const body = "Inter, Arial, Helvetica, sans-serif";

// Email clients ignore stylesheets and SVG, so this template uses tables, inline styles and a PNG logo.
export function codeEmail({ code, event, copy, siteUrl, logoUrl }) {
  const fill = (template) => template.replaceAll("{code}", code).replaceAll("{event}", event);
  const html = (template) => escape(fill(template));
  const link = (href, label) => `<a href="${escape(href)}" style="color:${colors.offwhite};text-decoration:underline;">${label}</a>`;

  return {
    subject: fill(copy.codeEmailSubject),
    text: [
      fill(copy.codeEmailTitle),
      fill(copy.codeEmailIntro),
      code,
      fill(copy.codeEmailExpiry),
      fill(copy.codeEmailIgnore),
      `ESISA Gaming Club · ${copy.codeEmailTagline}\n${siteUrl}`,
      copy.codeEmailAuto,
    ].join("\n\n"),
    html: `<!doctype html>
<html lang="${siteUrl.endsWith("/en") ? "en" : "fr"}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${html(copy.codeEmailSubject)}</title></head>
<body style="margin:0;padding:0;background:${colors.offwhite};">
<div style="display:none;max-height:0;overflow:hidden;">${html(copy.codeEmailPreview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${colors.offwhite};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
  <tr><td align="center" style="background:${colors.night};padding:32px 24px;">
    <a href="${escape(siteUrl)}"><img src="${escape(logoUrl)}" width="220" alt="ESISA Gaming Club" style="display:block;width:220px;max-width:100%;height:auto;border:0;"></a>
  </td></tr>
  <tr><td style="background:${colors.accent};height:4px;line-height:4px;font-size:0;">&nbsp;</td></tr>
  <tr><td style="background:#FFFFFF;padding:40px 32px;font-family:${body};color:${colors.graphite};">
    <p style="margin:0 0 12px;font-family:${display};font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:${colors.accent};">${escape(event)}</p>
    <h1 style="margin:0 0 16px;font-family:${display};font-size:28px;line-height:1.2;font-weight:700;text-transform:uppercase;color:${colors.night};">${html(copy.codeEmailTitle)}</h1>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">${html(copy.codeEmailIntro)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
      <td align="center" style="background:${colors.night};padding:24px 24px 24px 36px;font-family:${display};font-size:40px;font-weight:700;letter-spacing:12px;color:${colors.accent};">${code}</td>
    </tr></table>
    <p style="margin:24px 0 8px;font-size:15px;line-height:1.6;">${html(copy.codeEmailExpiry)}</p>
    <p style="margin:0;font-size:13px;line-height:1.6;color:${colors.muted};">${html(copy.codeEmailIgnore)}</p>
  </td></tr>
  <tr><td style="background:${colors.graphite};padding:28px 32px;font-family:${body};color:${colors.offwhite};font-size:13px;line-height:1.7;">
    <p style="margin:0 0 4px;font-family:${display};font-size:15px;font-weight:700;letter-spacing:1px;text-transform:uppercase;">ESISA Gaming Club</p>
    <p style="margin:0 0 16px;">${html(copy.codeEmailTagline)}</p>
    <p style="margin:0 0 16px;">${link(siteUrl, "esisa-gaming.club")} &nbsp;·&nbsp; ${link(socials.instagram, "Instagram")} &nbsp;·&nbsp; ${link(socials.discord, "Discord")} &nbsp;·&nbsp; ${link(socials.twitch, "Twitch")}</p>
    <p style="margin:0;font-size:11px;color:#B5B3AF;">${html(copy.codeEmailAuto)}</p>
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`,
  };
}

export async function sendEmail({ to, subject, text, html }) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: process.env.RESEND_FROM, to: [to], subject, text, html }),
  });

  if (!response.ok) {
    console.error("Resend failed", response.status, await response.text());
  }

  return response.ok;
}
