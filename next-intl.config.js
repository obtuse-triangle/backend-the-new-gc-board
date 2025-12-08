async function getMessages(locale) {
  const supportedLocales = ["ko", "en", "ja"];
  if (!supportedLocales.includes(locale)) {
    locale = "en";
  }
  try {
    return (await import(`./messages/${locale}.json`)).default;
  } catch {
    return (await import("./messages/en.json")).default;
  }
}

module.exports = async (request) => {
  // NextIntlRequest에서 locale 추출
  const locale = request.locale || "ko";
  const messages = await getMessages(locale);

  return {
    locale,
    messages,
    timeZone: "Asia/Seoul",
  };
};
