import { t } from "./i18n";
import { isNumeric, padLeft } from "./util";

// ISO8601 date format. Does not support week number or day-of-year notation,
// but does accept "XX" placeholders for month and date.
const ISO8601 =
    /^(\d{4}-(?:\d{2}|XX)-(?:\d{2}|XX))(?:T(\d\d:\d\d(?::\d\d)?)(\.\d+)?(.*))?$/i;

/**
 * @param {string} birthDay
 * @param {string} birthMonth
 * @param {import("./types").Locale} locale
 * @return {string}
 */
export const formatBirthDate = (birthDay, birthMonth, locale) => {
    const birthDayShort = isNumeric(birthDay)
        ? padLeft(birthDay, 2, "0")
        : birthDay;
    const birthMonthShort = isNumeric(birthMonth)
        ? monthNameShort(birthMonth, locale)
        : birthMonth;
    return birthDayShort + " " + birthMonthShort;
};

/**
 * @param {string} isoDateString
 * @return {string}
 */
export const formatDate = (isoDateString) => {
    const matches =
        typeof isoDateString === "string" && isoDateString.match(ISO8601);
    return matches ? flipDate(matches[1]) : isoDateString;
};

/**
 * @param {string} isoDateString
 * @return {string}
 */
export const formatDateTime = (isoDateString) => {
    const matches =
        typeof isoDateString === "string" && isoDateString.match(ISO8601);
    if (!matches) return isoDateString;
    if (!matches[2]) return flipDate(matches[1]);
    return flipDate(matches[1]) + ", " + matches[2].slice(0, 5);
};

/**
 * @param {number} timestampMs
 * @return {string}
 */
export const formatTimestamp = (timestampMs) => {
    const date = new Date(timestampMs);
    const offset = date.getTimezoneOffset();
    return (
        pad(date.getDate()) +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        date.getFullYear() +
        ", " +
        pad(date.getHours()) +
        ":" +
        pad(date.getMinutes()) +
        " (UTC" +
        (offset ? formatOffset(offset) : "") +
        ")"
    );
};

/**
 * @param {string} hours
 * @return {number}
 */
export const hoursInMs = (hours) => parseInt(hours, 10) * 3600000;

/**
 * @param {string} isoDate
 * @return {string}
 */
const flipDate = (isoDate) => {
    const parts = isoDate.slice(0, 10).split("-");
    return parts[2] + "-" + parts[1] + "-" + parts[0];
};

/**
 * @param {string|number} month
 * @param {import("./types").Locale} locale
 * @return {string}
 */
const monthNameShort = (month, locale) =>
    t(locale, "date.months.abbr." + month);

/**
 * @param {number} n
 * @return {string}
 */
const pad = (n) => (n < 10 ? "0" + n : "" + n);

/**
 * @param {number} offset
 * @return {string}
 */
const formatOffset = (offset) => {
    if (!offset) return "Z";
    const oh = Math.floor(Math.abs(offset / 60));
    const om = Math.floor(Math.abs(offset % 60));
    return (offset < 0 ? "+" : "-") + pad(oh) + ":" + pad(om);
};
