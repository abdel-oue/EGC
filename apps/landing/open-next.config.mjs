import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

// Cache Components need an incremental cache to serve prerendered shells and "use cache" entries.
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
