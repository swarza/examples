/**
 * The shop: its settings (from environment variables), its menu and its opening hours. The HTML
 * pages and the JSON API both read from here, so they always agree.
 */

const DEFAULT_TIME_ZONE = "Europe/London";

/** Settings from the Environment tab, with defaults so the app runs before you set anything. */
export function settings(env) {
  const shopName = env.SHOP_NAME?.trim() || "Halftone Coffee";
  let timeZone = env.TIME_ZONE?.trim() || DEFAULT_TIME_ZONE;
  try {
    new Intl.DateTimeFormat("en", { timeZone });
  } catch {
    console.warn(`TIME_ZONE "${timeZone}" is not a time zone; using ${DEFAULT_TIME_ZONE}`);
    timeZone = DEFAULT_TIME_ZONE;
  }
  return { shopName, timeZone, address: "14 Mill Lane", webhook: env.SIGNUP_WEBHOOK_URL?.trim() || null };
}

/** Monday first. `null` means closed all day. Times are in the shop's time zone. */
export const hours = [
  { day: "Monday", open: null, note: "Roasting day" },
  { day: "Tuesday", open: "07:30", close: "17:00" },
  { day: "Wednesday", open: "07:30", close: "17:00" },
  { day: "Thursday", open: "07:30", close: "17:00" },
  { day: "Friday", open: "07:30", close: "18:00" },
  { day: "Saturday", open: "08:30", close: "16:00" },
  { day: "Sunday", open: "09:00", close: "14:00" },
];

export const currency = "GBP";

export const menu = [
  {
    id: "espresso",
    title: "Espresso bar",
    note: "Every shot is our house blend unless you ask for the guest. Oat milk at no extra cost.",
    items: [
      { id: "espresso", name: "Espresso", price: 2.6, description: "A double shot, 36 g in 28 seconds" },
      { id: "cortado", name: "Cortado", price: 3.1, description: "Equal parts espresso and milk" },
      { id: "flat-white", name: "Flat white", price: 3.4, description: "Double shot, thin silky milk" },
      { id: "cappuccino", name: "Cappuccino", price: 3.5, description: "Double shot, more foam" },
      { id: "batch", name: "Batch brew", price: 2.8, description: "Whatever we are drinking this week" },
    ],
  },
  {
    id: "filter",
    title: "Filter",
    note: "Brewed to order on a V60. Ask us about the farm.",
    items: [
      {
        id: "kiambu",
        name: "Kiambu AA, Kenya",
        price: 4.2,
        description: "Washed, SL28 and SL34 from smallholder co-ops",
        notes: ["Blackcurrant", "Grapefruit", "Cane sugar"],
        featured: true,
      },
      {
        id: "huila",
        name: "Huila, Colombia",
        price: 3.8,
        description: "Washed Caturra from the south of Huila",
        notes: ["Red apple", "Caramel", "Cocoa"],
      },
      {
        id: "sidama",
        name: "Sidama, Ethiopia",
        price: 4.4,
        description: "Natural, dried whole on raised beds",
        notes: ["Strawberry", "Jasmine", "Black tea"],
        featured: true,
      },
    ],
  },
  {
    id: "food",
    title: "From the counter",
    note: "Baked down the road every morning. When it is gone, it is gone.",
    items: [
      {
        id: "bun",
        name: "Cardamom bun",
        price: 3.2,
        description: "Our most asked-about thing. Baked down the road at six",
        notes: ["Cardamom", "Brown butter"],
        featured: true,
      },
      { id: "croissant", name: "Almond croissant", price: 3.6, description: "Twice baked" },
      { id: "toast", name: "Sourdough toast", price: 3.0, description: "Salted butter, jam on the side" },
    ],
  },
  {
    id: "beans",
    title: "Beans to take home",
    note: "250 g bags, roasted on Monday. We grind for your brewer if you ask.",
    items: [
      {
        id: "house",
        name: "House blend",
        price: 11.5,
        description: "Brazil and Colombia",
        notes: ["Chocolate", "Hazelnut"],
      },
      {
        id: "kiambu-bag",
        name: "Kiambu AA, Kenya",
        price: 14.0,
        description: "For filter",
        notes: ["Blackcurrant", "Grapefruit"],
      },
      {
        id: "decaf",
        name: "Decaf, Colombia",
        price: 12.5,
        description: "Sugarcane process",
        notes: ["Toffee", "Milk chocolate"],
      },
    ],
  },
];

export const featured = menu.flatMap((section) => section.items.filter((item) => item.featured));

export const formatPrice = (price) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency }).format(price);
