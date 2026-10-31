import type { Store } from "./db";
import { buildSeed } from "./seed";
import type { Collections, CollectionName } from "./types";

/*
 * One-off data updates for databases that already exist (a fresh database is
 * seeded with current data instead). Each runs once per database, recorded by
 * a `homestay:migration:<id>` flag. They must be idempotent — two server
 * instances can start at the same moment — and should only change records
 * that still look like the sample data, never the host's own edits.
 */

type Migration = { id: string; run: (store: Store) => Promise<void> };

const MIGRATIONS: Migration[] = [
  {
    // The house is "Tricky" and its pets are two cats, Gunter and Eloise.
    id: "2026-10-tricky-and-cats",
    async run(store) {
      const seed = buildSeed();

      const settings = await store.getSettings();
      if (settings) {
        const next = { ...settings, wifi: { ...settings.wifi }, houseRules: [...settings.houseRules] };
        if (next.propertyName === "The Lakehouse") next.propertyName = seed.settings.propertyName;
        if (next.wifi.ssid === "Lakehouse-Guest") next.wifi.ssid = seed.settings.wifi.ssid;
        next.houseRules = next.houseRules.map((rule) =>
          rule === "Please keep the back gate latched so the dog can't get out." ? seed.settings.houseRules[0] : rule,
        );
        if (JSON.stringify(next) !== JSON.stringify(settings)) {
          await store.setSettings({ ...next, updatedAt: new Date().toISOString() });
        }
      }

      // Swap the sample dog and cat for the real cats, with their tasks.
      const oldPets = ["pet-biscuit", "pet-mochi"];
      const oldTasks = ["task-feed-biscuit", "task-walk-biscuit", "task-feed-mochi"];
      const hasOldPets = (await Promise.all(oldPets.map((id) => store.get("pets", id)))).some(Boolean);
      if (!hasOldPets) return;

      const completions = await store.list("completions");
      await Promise.all([
        ...oldPets.map((id) => store.delete("pets", id)),
        ...oldTasks.map((id) => store.delete("tasks", id)),
        ...completions.filter((c) => oldTasks.includes(c.taskId)).map((c) => store.delete("completions", c.id)),
      ]);

      const keepTasks = new Set(["task-litter"]); // still exists; its pet link changes
      await putFromSeed(store, "pets", seed.docs.pets);
      await putFromSeed(
        store,
        "tasks",
        seed.docs.tasks.filter((t) => t.id.startsWith("task-feed-") || keepTasks.has(t.id)),
      );
    },
  },
];

async function putFromSeed<C extends CollectionName>(
  store: Store,
  collection: C,
  docs: { id: string }[],
): Promise<void> {
  const now = new Date().toISOString();
  await store.put(collection, docs.map((d) => ({ ...d, createdAt: now, updatedAt: now })) as Collections[C][]);
}

/** Apply any migrations this database hasn't had yet. */
export async function runMigrations(store: Store): Promise<void> {
  for (const m of MIGRATIONS) {
    const flag = `migration:${m.id}`;
    if (await store.hasFlag(flag)) continue;
    await m.run(store);
    await store.setFlag(flag);
  }
}
