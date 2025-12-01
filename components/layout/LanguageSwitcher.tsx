"use client";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { locales, Locale } from "../../i18n";

function replaceLocaleInPath(pathname: string, nextLocale: Locale) {
  const segments = pathname.split("/");
  // ['', 'ko', '...'] 형태를 가정
  if (segments.length > 1 && locales.includes(segments[1] as Locale)) {
    segments[1] = nextLocale;
    return segments.join("/");
  }
  // 로케일 세그먼트가 없으면 앞에 붙임
  return `/${nextLocale}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      aria-label="Language selector"
      className="border rounded px-2 py-1 text-sm bg-white dark:bg-zinc-900"
      value={locale}
      onChange={(e) => {
        const nextLocale = e.target.value as Locale;
        const href = replaceLocaleInPath(pathname || "/", nextLocale);
        router.push(href);
      }}
    >
      {locales.map((l) => (
        <option key={l} value={l}>
          {l.toUpperCase()}
        </option>
      ))}
    </select>
  );
}
