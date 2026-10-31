import type { ISODate, LocalTime, Timestamp, Weekday } from "./time";

export type { ISODate, LocalTime, Timestamp, Weekday };

/** Fields every stored document has. Managed by lib/db.ts. */
export interface BaseDoc {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/** Singleton: property-wide configuration. */
export interface Settings {
  propertyName: string;
  address: string;
  hostName: string;
  welcomeMessage: string;
  checkInTime: LocalTime;
  checkOutTime: LocalTime;
  wifi: {
    ssid: string;
    password: string;
    security: "WPA" | "WEP" | "nopass";
    hidden?: boolean;
  };
  houseRules: string[];
  updatedAt: Timestamp;
}

/** A guest's visit. Dates are inclusive New York calendar dates. */
export interface Stay extends BaseDoc {
  guestName: string;
  startDate: ISODate;
  endDate: ISODate;
  notes?: string;
}

export interface Pet extends BaseDoc {
  name: string;
  species: "dog" | "cat" | "bird" | "fish" | "other";
  breed?: string;
  photoUrl?: string;
  about: string;
  feeding: string;
  medical?: string;
  /** Contact.id of the vet. */
  vetContactId?: string;
  /** Where the pet tends to hide, so the sitter can find them. */
  hidingSpots?: string[];
  order: number;
}

export type TaskSchedule =
  | { type: "daily"; times: LocalTime[] }
  | { type: "weekly"; days: Weekday[]; time: LocalTime }
  | { type: "once"; date: ISODate; time: LocalTime };

export interface Task extends BaseDoc {
  title: string;
  details?: string;
  category: "pet" | "home" | "plants" | "trash" | "other";
  /** Pet.id when the task is for a specific pet. */
  petId?: string;
  schedule: TaskSchedule;
  active: boolean;
  /** Nice-to-have (e.g. a treat): never shown as overdue and not counted in progress. */
  optional?: boolean;
  order: number;
}

/**
 * One occurrence of a Task being done. Identified by task + date + time slot,
 * so marking the same slot twice is idempotent (see completionId()).
 */
export interface Completion extends BaseDoc {
  taskId: string;
  date: ISODate;
  time: LocalTime;
  completedAt: Timestamp;
  note?: string;
}

export interface HowTo extends BaseDoc {
  title: string;
  category: "pets" | "appliances" | "entertainment" | "climate" | "outdoor" | "safety" | "other";
  summary?: string;
  steps: string[];
  order: number;
}

export interface Place extends BaseDoc {
  name: string;
  category:
    | "food"
    | "coffee"
    | "grocery"
    | "pharmacy"
    | "park"
    | "attraction"
    | "shopping"
    | "medical";
  description: string;
  address?: string;
  driveMinutes?: number;
  phone?: string;
  url?: string;
  favorite?: boolean;
  order: number;
}

export interface Contact extends BaseDoc {
  name: string;
  role: string;
  phone?: string;
  email?: string;
  notes?: string;
  emergency: boolean;
  order: number;
}

/** Door / gate / alarm / lockbox codes. Treat `value` as sensitive. */
export interface Code extends BaseDoc {
  label: string;
  value: string;
  location?: string;
  notes?: string;
  order: number;
}

/** Map of collection name → document type. */
export interface Collections {
  stays: Stay;
  pets: Pet;
  tasks: Task;
  completions: Completion;
  howtos: HowTo;
  places: Place;
  contacts: Contact;
  codes: Code;
}

export type CollectionName = keyof Collections;

/** What callers pass to upsert: id optional (generated if missing), timestamps managed. */
export type Upsert<T extends BaseDoc> = Omit<T, keyof BaseDoc> & { id?: string };
