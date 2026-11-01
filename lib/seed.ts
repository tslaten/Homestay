import type { Collections, Settings, Upsert } from "./types";

/**
 * Sample data for local development and first deploys. Everything here is
 * placeholder content — replace it via the admin screens (coming later) or
 * by editing this file and running `npm run db:seed -- --force`.
 */

export type SeedDocs = { [C in keyof Collections]: (Upsert<Collections[C]> & { id: string })[] };

export function buildSeed(now: Date = new Date()): { settings: Settings; docs: SeedDocs } {
  const stamp = now.toISOString();

  const settings: Settings = {
    propertyName: "Tricky",
    address: "3321 Clemwood Dr, Orlando, FL 32803",
    hostName: "Troy",
    welcomeMessage: "Make yourself at home. Everything you need is on this screen.",
    checkInTime: "16:00",
    checkOutTime: "10:00",
    wifi: { ssid: "Tricky", password: "zero0101", security: "WPA" },
    houseRules: [
      "Please keep outside doors closed so the cats stay inside.",
      "Quiet hours are 10 PM – 7 AM.",
      "No smoking inside the house.",
    ],
    updatedAt: stamp,
  };

  const docs: SeedDocs = {
    stays: [
      {
        id: "stay-2026-11",
        guestName: "Guest",
        startDate: "2026-11-02",
        endDate: "2026-11-16",
      },
    ],

    contacts: [
      {
        id: "contact-host",
        name: "Troy",
        role: "Homeowner",
        phone: "(352) 613-4447",
        emergency: false,
        order: 1,
      },
      {
        id: "contact-vet",
        name: "Banfield Pet Hospital",
        role: "Veterinarian · Mills Park",
        phone: "(407) 228-1701",
        notes: "1430 N Mills Ave #130, Orlando, FL 32803",
        emergency: false,
        order: 2,
      },
      {
        id: "contact-veg",
        name: "VEG ER for Pets – Winter Park",
        role: "24/7 pet emergency hospital",
        phone: "(407) 992-7753",
        notes: "1490 W Fairbanks Ave, Winter Park, FL 32789. Walk in any time, no appointment needed.",
        emergency: true,
        order: 1,
      },
      {
        id: "contact-911",
        name: "Emergency Services",
        role: "Police · Fire · Ambulance",
        phone: "911",
        emergency: true,
        order: 0,
      },
      {
        id: "contact-aspca",
        name: "ASPCA Animal Poison Control",
        role: "Pet poison emergencies (24/7, fee may apply)",
        phone: "(888) 426-4435",
        emergency: true,
        order: 3,
      },
    ],

    pets: [
      {
        id: "pet-gunter",
        name: "Gunter",
        species: "cat",
        about:
          "Likes to dash outside to play, but won’t run away from the property. If he gets out, don’t panic: just pick him up and bring him back.",
        feeding: "Wet food (Sheba Cuts) every morning and every night.",
        medical: "½ capsule of gabapentin every morning, mixed into the wet food.",
        hidingSpots: ["Master bedroom closet", "Under the master bedroom bed", "On a dining room chair"],
        vetContactId: "contact-vet",
        order: 1,
      },
      {
        id: "pet-eloise",
        name: "Eloise",
        species: "cat",
        about: "Likes to hide, especially when it storms.",
        feeding: "A churu treat at night is optional.",
        hidingSpots: [
          "Troy’s office closet",
          "Master bedroom closet",
          "Behind the couch when it storms",
          "If the guest bedroom door is open: its closets, including the storage closet",
        ],
        vetContactId: "contact-vet",
        order: 2,
      },
    ],

    // Times are New York wall-clock; "morning" = 8:00 AM, "night" = 7:00 PM.
    tasks: [
      {
        id: "task-gunter-breakfast",
        title: "Feed Gunter + medication",
        details: "Wet food (Sheba Cuts) with ½ capsule of gabapentin mixed in.",
        category: "pet",
        petId: "pet-gunter",
        schedule: { type: "daily", times: ["08:00"] },
        active: true,
        order: 1,
      },
      {
        id: "task-water-fountain",
        title: "Check the water fountain",
        details: "Make sure the automatic water fountain is running.",
        category: "pet",
        schedule: { type: "daily", times: ["08:00"] },
        active: true,
        order: 2,
      },
      {
        id: "task-auto-feeder",
        title: "Check the automatic feeder",
        details: "Make sure it dispensed this morning’s food.",
        category: "pet",
        schedule: { type: "daily", times: ["08:00"] },
        active: true,
        order: 3,
      },
      {
        id: "task-clean-litter",
        title: "Clean the litter box",
        category: "pet",
        schedule: { type: "daily", times: ["08:00"] },
        active: true,
        order: 4,
      },
      {
        id: "task-auto-litter",
        title: "Check the automatic litter box",
        category: "pet",
        schedule: { type: "daily", times: ["08:00"] },
        active: true,
        order: 5,
      },
      {
        id: "task-gunter-dinner",
        title: "Feed Gunter",
        details: "Wet food (Sheba Cuts).",
        category: "pet",
        petId: "pet-gunter",
        schedule: { type: "daily", times: ["19:00"] },
        active: true,
        order: 6,
      },
      {
        id: "task-eloise-churu",
        title: "Churu for Eloise",
        details: "A treat, if you like.",
        category: "pet",
        petId: "pet-eloise",
        schedule: { type: "daily", times: ["19:00"] },
        active: true,
        optional: true,
        order: 7,
      },
      // Halfway through the Nov 2–16 stay: top up the automatic devices.
      ...(
        [
          ["task-topup-feeder", "Top up the automatic feeder", "Refill the food in the automatic feeder."],
          ["task-topup-fountain", "Top up the water fountain", "Refill the water in the automatic fountain."],
          ["task-topup-litter", "Top up the automatic litter box", "Add litter to the automatic litter box."],
        ] as const
      ).map(([id, title, details], i) => ({
        id,
        title,
        details,
        category: "pet" as const,
        schedule: { type: "once" as const, date: "2026-11-09", time: "08:00" },
        active: true,
        order: 20 + i,
      })),
      {
        id: "task-see-cats",
        title: "See both cats",
        details: "Make sure you’ve seen Gunter and Eloise today so neither is stuck anywhere. Hiding spots are on the Pets screen.",
        category: "pet",
        schedule: { type: "daily", times: ["19:00"] },
        active: true,
        order: 9,
      },
      {
        id: "task-trash-monday",
        title: "Take the trash out",
        details: "Trash day is Tuesday, so put the bins out tonight.",
        category: "trash",
        schedule: { type: "weekly", days: [1], time: "19:00" },
        active: true,
        order: 10,
      },
      {
        id: "task-bouncy-ball",
        title: "New bouncy ball",
        details: "Give them a new bouncy ball to play with.",
        category: "pet",
        schedule: { type: "daily", times: ["19:00"] },
        active: true,
        order: 8,
      },
    ],

    completions: [],

    howtos: [
      {
        id: "howto-cat-hiding",
        title: "Where the cats hide",
        category: "pets",
        summary: "Please see each cat every day to make sure neither is stuck anywhere.",
        steps: [
          "Eloise: Troy’s office closet, the master bedroom closet, and behind the couch when it storms.",
          "If you leave the guest bedroom door open, Eloise might hide in one of its closets, including the storage closet.",
          "Gunter: the master bedroom closet, under the master bedroom bed, and on a dining room chair.",
        ],
        order: 1,
      },
      {
        id: "howto-gunter-outside",
        title: "If Gunter gets out",
        category: "pets",
        summary: "Gunter tries to run outside to play, but he won’t run away from the property.",
        steps: ["Don’t panic.", "Pick him up and bring him back inside."],
        order: 2,
      },
      {
        id: "howto-front-door",
        title: "Front door",
        category: "safety",
        summary: "The keypad code is on the Codes screen.",
        steps: ["When you leave, press Lock on the keypad.", "Pull the door towards you until the lock engages."],
        order: 3,
      },
      {
        id: "howto-guest-thermostat",
        title: "Guest room thermostat",
        category: "climate",
        summary: "Set it to whatever you like. It only controls your half of the house.",
        steps: [],
        order: 4,
      },
      {
        id: "howto-bathroom",
        title: "Bathroom",
        category: "other",
        summary: "Open the bathroom window when you shower to vent the moisture.",
        steps: [],
        order: 5,
      },
      {
        id: "howto-laundry",
        title: "Laundry",
        category: "appliances",
        summary: "The laundry is in the shed next to the carport.",
        steps: [],
        order: 6,
      },
      {
        id: "howto-tv",
        title: "Living room TV",
        category: "entertainment",
        summary: "Switch the TV to HDMI 1 for the Apple TV. All the apps are there.",
        steps: [],
        order: 7,
      },
      {
        id: "howto-trash",
        title: "Trash day",
        category: "outdoor",
        summary: "Trash day is every Tuesday.",
        steps: [],
        order: 8,
      },
    ],

    places: [
      {
        id: "place-banfield",
        name: "Banfield Pet Hospital",
        category: "medical",
        description: "Gunter and Eloise’s vet: preventive care, surgery and dental care.",
        address: "1430 N Mills Ave #130, Orlando, FL 32803",
        phone: "(407) 228-1701",
        url: "https://www.banfield.com",
        order: 10,
      },
      {
        id: "place-veg",
        name: "VEG ER for Pets – Winter Park",
        category: "medical",
        description: "24/7 pet emergency hospital. Walk in any time, no appointment needed.",
        address: "1490 W Fairbanks Ave, Winter Park, FL 32789",
        phone: "(407) 992-7753",
        order: 11,
      },
      {
        id: "place-lake-eola",
        name: "Lake Eola Park",
        category: "park",
        description: "Downtown lake loop, swan boats, and a Sunday farmers market.",
        address: "512 E Washington St, Orlando, FL 32801",
        favorite: true,
        order: 1,
      },
      {
        id: "place-baldwin-park",
        name: "Baldwin Park",
        category: "park",
        description: "Lake views. One loop around the park is 2.5 miles, or hang out around the piers.",
        order: 2,
      },
      // Coffee
      ...(
        [
          ["place-haan", "Haan", "Korean-style coffee. Really good strawberry matcha."],
          ["place-cafe-maiko", "Cafe Maiko", "Good all-around matcha."],
          ["place-easy-luck", "Easy Luck", "Quick service, solid espresso."],
        ] as const
      ).map(([id, name, description], i) => ({ id, name, category: "coffee" as const, description, order: 20 + i })),
      // Food
      ...(
        [
          ["place-moderne", "Moderne", "Elevated Asian fusion."],
          [
            "place-mills-market",
            "Mills Market",
            "Asian food hall: onigiri, Vietnamese street food, banh mi, Japanese curry and a konbini.",
          ],
          ["place-the-strand", "The Strand", "Elevated New American."],
          ["place-domu", "Domu", "Ramen. Try the wings!"],
          ["place-secret-slice", "The Secret Slice", "Pizza."],
          ["place-sodough", "Sodough", "Detroit-style pizza."],
          ["place-mia-kai", "Mia Kai", "Hawaiian."],
          ["place-east-end-market", "East End Market", "Another small food hall."],
          ["place-jay-lucys", "Jay Lucy’s", "A solid burger."],
          ["place-sticky-rice", "Sticky Rice", "Lao street food."],
          ["place-black-bean-deli", "Black Bean Deli", "Solid Cuban food and empanadas."],
          ["place-sampaguita", "Sampaguita", "Filipino-inspired ice cream flavors."],
          ["place-jam-hot-chicken", "Jam Hot Chicken", "A really good chicken sandwich."],
          ["place-buttermilk-bakery", "Buttermilk Bakery", "The best baked goods in Orlando."],
          ["place-7bites", "7Bites", "Southern-style, indulgent breakfast."],
          ["place-crocante", "Crocante", "Elevated Puerto Rican food."],
        ] as const
      ).map(([id, name, description], i) => ({ id, name, category: "food" as const, description, order: 30 + i })),
    ],

    codes: [
      {
        id: "code-front-door",
        label: "Front door",
        value: "8282",
        location: "Keypad on the front door",
        notes: "When you leave, press Lock on the keypad, then pull the door towards you until the lock engages.",
        order: 1,
      },
    ],
  };

  return { settings, docs };
}
