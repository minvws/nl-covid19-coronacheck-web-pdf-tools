import en from "./en.js";
import nl from "./nl.js";

const lang = { en, nl };

/**
 * @param {import("../types").Locale} locale
 * @param {string} segment
 * @param {Record<string, string>} [data]
 */
export const t = (locale, segment, data) => {
    let translation = (lang[locale] || nl)[segment] || segment;
    if (data) {
        for (const key of Object.keys(data)) {
            translation = translation.replace("%{" + key + "}", data[key]);
        }
    }
    return translation;
};
