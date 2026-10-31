import "server-only";

import { Redis } from "@upstash/redis";

import { runMigrations } from "./migrations";
import { buildSeed } from "./seed";
import type {
  BaseDoc,
  CollectionName,
  Collections,
  Completion,
  ISODate,
  LocalTime,
  Settings,
  Stay,
  Upsert,
} from "./types";
import { isDateInRange } from "./time";

export type * from "./types";

/*
 * Storage layout (Upstash Redis):
 *   homestay:settings          JSON value  — Settings singleton
 *   homestay:<collection>      HASH        — field = doc id, value = JSON doc
 *   homestay:seeded            "1"         — set once seed data is written; never
 *                                           re-seeded automatically after that
 *
 * If no Upstash credentials are configured, an in-memory store pre-loaded
 * with seed data is used instead (handy for `next dev`; resets on restart).
 */

const PREFIX = "homestay";
const SETTINGS_KEY = `${PREFIX}:settings`;
const SEEDED_KEY = `${PREFIX}:seeded`;
const collectionKey = (c: CollectionName) => `${PREFIX}:${c}`;

// ---------------------------------------------------------------------------
// Backends
// ---------------------------------------------------------------------------

export interface Store {
  getSettings(): Promise<Settings | null>;
  setSettings(settings: Settings): Promise<void>;
  get<C extends CollectionName>(c: C, id: string): Promise<Collections[C] | null>;
  list<C extends CollectionName>(c: C): Promise<Collections[C][]>;
  put<C extends CollectionName>(c: C, docs: Collections[C][]): Promise<void>;
  delete(c: CollectionName, id: string): Promise<boolean>;
  isSeeded(): Promise<boolean>;
  markSeeded(): Promise<void>;
  /** Permanent once-only markers (used to record applied data migrations). */
  hasFlag(key: string): Promise<boolean>;
  setFlag(key: string): Promise<void>;
}

function redisStore(redis: Redis): Store {
  return {
    async getSettings() {
      return redis.get<Settings>(SETTINGS_KEY);
    },
    async setSettings(settings) {
      await redis.set(SETTINGS_KEY, settings);
    },
    async get(c, id) {
      return redis.hget(collectionKey(c), id);
    },
    async list(c) {
      const all = await redis.hgetall<Record<string, Collections[typeof c]>>(collectionKey(c));
      return all ? Object.values(all) : [];
    },
    async put(c, docs) {
      if (docs.length === 0) return;
      await redis.hset(collectionKey(c), Object.fromEntries(docs.map((d) => [d.id, d])));
    },
    async delete(c, id) {
      return (await redis.hdel(collectionKey(c), id)) > 0;
    },
    async isSeeded() {
      return (await redis.exists(SEEDED_KEY)) === 1;
    },
    async markSeeded() {
      await redis.set(SEEDED_KEY, "1");
    },
    async hasFlag(key) {
      return (await redis.exists(`${PREFIX}:${key}`)) === 1;
    },
    async setFlag(key) {
      await redis.set(`${PREFIX}:${key}`, "1");
    },
  };
}

function memoryStore(): Store {
  let settings: Settings | null = null;
  let seeded = false;
  const flags = new Set<string>();
  const data = new Map<CollectionName, Map<string, BaseDoc>>();
  const coll = (c: CollectionName) => {
    if (!data.has(c)) data.set(c, new Map());
    return data.get(c)!;
  };
  // structuredClone so callers can't mutate stored objects (mirrors Redis).
  return {
    async getSettings() {
      return settings && structuredClone(settings);
    },
    async setSettings(s) {
      settings = structuredClone(s);
    },
    async get(c, id) {
      const doc = coll(c).get(id);
      return doc ? (structuredClone(doc) as Collections[typeof c]) : null;
    },
    async list(c) {
      return [...coll(c).values()].map((d) => structuredClone(d) as Collections[typeof c]);
    },
    async put(c, docs) {
      for (const d of docs) coll(c).set(d.id, structuredClone(d));
    },
    async delete(c, id) {
      return coll(c).delete(id);
    },
    async isSeeded() {
      return seeded;
    },
    async markSeeded() {
      seeded = true;
    },
    async hasFlag(key) {
      return flags.has(key);
    },
    async setFlag(key) {
      flags.add(key);
    },
  };
}

const redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
const usingRedis = Boolean(redisUrl && redisToken);

export const storageBackend: "redis" | "memory" = usingRedis ? "redis" : "memory";

function createStore(): Store {
  if (usingRedis) return redisStore(new Redis({ url: redisUrl!, token: redisToken! }));
  if (process.env.VERCEL_ENV === "production") {
    throw new Error("Upstash Redis is not configured (UPSTASH_REDIS_REST_URL / _TOKEN).");
  }
  return memoryStore();
}

// Survive hot reloads in dev so the in-memory store isn't wiped on every edit.
const globalForDb = globalThis as unknown as {
  __homestayStore?: Store;
  __homestaySeeding?: Promise<unknown>;
};
const store: Store = (globalForDb.__homestayStore ??= createStore());

/** Writes seed data if the store is empty (or always, with `force`). */
export async function seed({ force = false }: { force?: boolean } = {}): Promise<boolean> {
  if (!force && (await store.isSeeded())) return false;
  const { settings, docs } = buildSeed();
  const now = new Date().toISOString();
  await store.setSettings(settings);
  for (const c of Object.keys(docs) as CollectionName[]) {
    const stamped = docs[c].map((d) => ({ ...d, createdAt: now, updatedAt: now }));
    await store.put(c, stamped as Collections[typeof c][]);
  }
  await store.markSeeded();
  return true;
}

/**
 * Seed on first access if the store is empty: always for the in-memory store,
 * and once for a fresh Redis database so a new deploy shows sample content
 * instead of blank screens. Once `homestay:seeded` exists this is one EXISTS
 * call per server instance. Then pending data migrations (lib/migrations.ts)
 * run once. A failed attempt is retried on the next request.
 */
async function ready(): Promise<Store> {
  await (globalForDb.__homestaySeeding ??= seed()
    .then(() => runMigrations(store))
    .catch((err) => {
      globalForDb.__homestaySeeding = undefined;
      throw err;
    }));
  return store;
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function getSettings(): Promise<Settings> {
  const s = await (await ready()).getSettings();
  return s ?? buildSeed().settings;
}

export async function updateSettings(patch: Partial<Omit<Settings, "updatedAt">>): Promise<Settings> {
  const next: Settings = { ...(await getSettings()), ...patch, updatedAt: new Date().toISOString() };
  await (await ready()).setSettings(next);
  return next;
}

// ---------------------------------------------------------------------------
// Collections: get / list / upsert / delete
// ---------------------------------------------------------------------------

type Comparator<T> = (a: T, b: T) => number;

const byOrder: Comparator<{ order: number; id: string }> = (a, b) =>
  a.order - b.order || a.id.localeCompare(b.id);

function repo<C extends CollectionName>(c: C, sort: Comparator<Collections[C]>) {
  type T = Collections[C];
  return {
    async get(id: string): Promise<T | null> {
      return (await ready()).get(c, id);
    },
    async list(): Promise<T[]> {
      return (await (await ready()).list(c)).sort(sort);
    },
    /** Create (no id / unknown id) or replace (existing id). Returns the stored doc. */
    async upsert(input: Upsert<T>): Promise<T> {
      const s = await ready();
      const now = new Date().toISOString();
      const id = input.id ?? crypto.randomUUID();
      const existing = input.id ? await s.get(c, id) : null;
      const doc = { ...input, id, createdAt: existing?.createdAt ?? now, updatedAt: now } as T;
      await s.put(c, [doc]);
      return doc;
    },
    /** Returns true if something was deleted. */
    async delete(id: string): Promise<boolean> {
      return (await ready()).delete(c, id);
    },
  };
}

export const stays = repo("stays", (a, b) => a.startDate.localeCompare(b.startDate));
export const pets = repo("pets", byOrder);
export const tasks = repo("tasks", byOrder);
export const completions = repo(
  "completions",
  (a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time),
);
export const howtos = repo("howtos", byOrder);
export const places = repo("places", byOrder);
export const contacts = repo("contacts", byOrder);
export const codes = repo("codes", byOrder);

/** Everything in one object, e.g. `db.pets.list()`. */
export const db = { stays, pets, tasks, completions, howtos, places, contacts, codes };

// ---------------------------------------------------------------------------
// Domain helpers
// ---------------------------------------------------------------------------

/** The stay covering `date` (New York calendar date), if any. */
export async function getStayOn(date: ISODate): Promise<Stay | null> {
  const all = await stays.list();
  return all.find((s) => isDateInRange(date, s.startDate, s.endDate)) ?? null;
}

/** Deterministic id: one completion per task occurrence. */
export function completionId(taskId: string, date: ISODate, time: LocalTime): string {
  return `${date}T${time}:${taskId}`;
}

export async function listCompletionsOn(date: ISODate): Promise<Completion[]> {
  return (await completions.list()).filter((c) => c.date === date);
}

export async function completeTask(
  taskId: string,
  date: ISODate,
  time: LocalTime,
  note?: string,
): Promise<Completion> {
  return completions.upsert({
    id: completionId(taskId, date, time),
    taskId,
    date,
    time,
    completedAt: new Date().toISOString(),
    note,
  });
}

export async function uncompleteTask(taskId: string, date: ISODate, time: LocalTime) {
  return completions.delete(completionId(taskId, date, time));
}
