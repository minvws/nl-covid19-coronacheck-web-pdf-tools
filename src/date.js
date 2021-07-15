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
 * @param {number} n
 * @return {string}
 */
const pad = (n) => (n < 10 ? "0" + n : "" + n);

const formatter =
    "Intl" in window &&
    new Intl.DateTimeFormat("nl-NL", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
    });

/**
 * @param {Date|number|string} datetime - Date instance, timestamp in ms, or ISO8601 string
 * @return {string}
 */
export const formatDateTime = (datetime) => {
    if (!(datetime instanceof Date)) datetime = new Date(datetime);
    if (
        formatter &&
        formatter.resolvedOptions &&
        formatter.resolvedOptions().timeZone
    ) {
        try {
            const parts = formatter.format(datetime).split(" ");
            return parts[0] + ", " + parts[1] + " (" + parts[2] + ")";
        } catch (e) {}
    }
    const offset = datetime.getTimezoneOffset();
    return (
        pad(datetime.getDate()) +
        "-" +
        pad(datetime.getMonth() + 1) +
        "-" +
        datetime.getFullYear() +
        ", " +
        pad(datetime.getHours()) +
        ":" +
        pad(datetime.getMinutes()) +
        " (" +
        formatOffset(offset) +
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
 * @param {number|string} offset
 * @return {string}
 */
const formatOffset = (offset) => {
    if (!offset) return "UTC";
    if (typeof offset === "number") {
        const oh = Math.floor(Math.abs(offset / 60));
        const om = Math.floor(Math.abs(offset % 60));
        return (
            "UTC" + (offset < 0 ? "+" : "-") + oh + (om ? ":" + pad(om) : "")
        );
    }
    if (offset === "Z") return "UTC";
    const parts = offset.split(":");
    if (parseInt(parts[0], 10) || parseInt(parts[1], 10)) {
        return "UTC" + offset;
    }
    return "UTC";
};
