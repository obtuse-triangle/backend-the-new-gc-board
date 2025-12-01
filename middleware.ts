import createMiddleware from "next-intl/middleware";
import { defaultLocale, getSupportedLocales } from "./i18n";

export default createMiddleware({
  locales: getSupportedLocales(),
  defaultLocale,
  localePrefix: "always",
});

export const config = {
  matcher: [
    "/",
    "/((?!api|_next|.*\\..*).*)", // 모든 정적/next/api 제외
  ],
};
