/**
 * Seed Upstash Redis with sample data. The app also does this by itself the
 * first time it sees an empty database, so this is mainly for --force.
 *   npm run db:seed            # only if not seeded yet
 *   npm run db:seed -- --force # overwrite settings + seed docs (other docs are kept)
 * Reads credentials from .env.local (see .env.example).
 */
import { seed, storageBackend } from "../lib/db";

if (storageBackend !== "redis") {
  console.error("No Upstash credentials found. Add them to .env.local (see .env.example).");
  process.exit(1);
}

const force = process.argv.includes("--force");

seed({ force }).then(
  (wrote) => {
    console.log(wrote ? "Seed data written." : "Already seeded — pass --force to overwrite.");
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
