import type { CartItem } from "./shop-data";

const rawId = import.meta.env["VITE_GA4_MEASUREMENT_ID"]?.trim() ?? "";
export const ga4Id = /^G-[A-Z0-9]+$/.test(rawId) ? rawId : "";
const preferenceKey = "ppg-analytics-consent";

type GoogleWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

type EventName = "view_item" | "add_to_cart" | "begin_checkout" | "order_submitted";

let initialized = false;
let allowed = false;

export function readAnalyticsPreference() {
  try {
    const value = localStorage.getItem(preferenceKey);
    return value === "allow" || value === "deny" ? value : null;
  } catch {
    return null;
  }
}

export function setAnalyticsPreference(allow: boolean) {
  try {
    localStorage.setItem(preferenceKey, allow ? "allow" : "deny");
  } catch {
    // The preference still applies during this page visit.
  }
  applyAnalyticsPreference(allow);
}

export function applyAnalyticsPreference(allow: boolean) {
  if (!ga4Id || typeof window === "undefined") return;

  const browser = window as GoogleWindow & Record<string, unknown>;
  allowed = allow;
  browser[`ga-disable-${ga4Id}`] = !allow;
  if (!allow || initialized) return;

  initialized = true;
  const queue = (browser.dataLayer ??= []);
  browser.gtag ??= function () {
    // The Google tag queue consumes the arguments object.
    queue.push(arguments);
  };
  browser.gtag("js", new Date());
  browser.gtag("config", ga4Id, {
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
  document.head.appendChild(script);
}

export function analyticsItem(item: CartItem) {
  return {
    item_id: item.product === "seasoned" ? "seasoned" : item.key,
    item_name: item.name,
    ...(item.product === "seasoned" ? { item_variant: item.key } : {}),
    price: item.unitPrice,
    quantity: item.quantity,
  };
}

export function trackShopEvent(
  name: EventName,
  items: { item_id: string; item_name: string; item_variant?: string; price?: number; quantity?: number }[],
  value?: number,
) {
  if (!ga4Id || !allowed || typeof window === "undefined") return;
  (window as GoogleWindow).gtag?.("event", name, {
    send_to: ga4Id,
    items,
    ...(value === undefined ? {} : { currency: "TWD", value }),
  });
}
