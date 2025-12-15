"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useLocale, useTranslations } from "next-intl";
import LanguageSwitcher from "./LanguageSwitcher";

function classNames(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function GNB() {
  const locale = useLocale();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const tNav = useTranslations("Nav");

  const links = [
    { href: `/${locale}`, label: tNav("home") },
    { href: `/${locale}/posts`, label: tNav("posts") },
  ];

  const isAuthed = status === "authenticated";
  const userLabel = session?.user?.username || session?.user?.email || "";

  return (
    <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/80 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link
          href={`/${locale}`}
          className="text-sm font-semibold tracking-tight text-gray-900 dark:text-gray-50"
        >
          Image Board
        </Link>

        <nav className="flex items-center gap-3 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={classNames(
                  "rounded px-2 py-1 transition",
                  active
                    ? "bg-gray-200 text-gray-900 dark:bg-zinc-800 dark:text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-zinc-800 dark:hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <LanguageSwitcher />
          {isAuthed ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300" title={userLabel}>
                {userLabel || ""}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: `/${locale}` })}
                className="rounded bg-black px-3 py-1 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
              >
                {tNav("logout")}
              </button>
            </div>
          ) : (
            <Link
              href={`/${locale}/login`}
              className="rounded bg-black px-3 py-1 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {tNav("login")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default GNB;
