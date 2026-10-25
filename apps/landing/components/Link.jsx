// ponytail: full page loads instead of next/link. On Workers, client-side navigation
// receives RSC payloads without their dynamic content (opennextjs-cloudflare #1223/#1369).
// Switch the imports back to next/link once the adapter fix is released.
export default function Link({ href, prefetch, scroll, replace, children, ...props }) {
  return <a href={href} {...props}>{children}</a>;
}
