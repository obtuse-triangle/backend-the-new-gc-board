export const locales = ["ko", "en", "ja"] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = (process.env.DEFAULT_LOCALE as Locale) || "ko";

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export async function getMessages(locale: Locale) {
  try {
    switch (locale) {
      case "ko":
        return (await import("./messages/ko.json")).default;
      case "ja":
        return (await import("./messages/ja.json")).default;
      case "en":
      default:
        return (await import("./messages/en.json")).default;
    }
  } catch {
    return (await import("./messages/en.json")).default;
  }
}

export function getSupportedLocales(): Locale[] {
  const env = process.env.SUPPORTED_LOCALES;
  if (!env) return [...locales];
  return env.split(",").filter(isLocale) as Locale[];
}
