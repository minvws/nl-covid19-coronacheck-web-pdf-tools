import en from "./en.js";
import nl from "./nl.js";

var lang = { en, nl };

/**
 * @param {import("../types").Locale} locale
 * @param {string} segment
 * @param {Record<string, string>} [data]
 */
export function t(locale, segment, data) {
    let translation = (lang[locale] || nl)[segment] || segment;
    if (data) {
        for (var key of Object.keys(data)) {
            translation = translation.replace("%{" + key + "}", data[key]);
        }
    }
    return translation;
}

export const regionNames = {
    en: "en", // new Intl.DisplayNames(["en"], { type: "region" }),
    nl: "nl", // new Intl.DisplayNames(["nl"], { type: "region" }),
};
